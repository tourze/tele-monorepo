/**
 * Copyright (c) 2013, The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.brobwind.bronil;

import android.os.RemoteException;
import android.util.Log;

import com.shadow.ssrclient.util.DxNetworkUtil;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @hide
 */
public class ProxyServer extends Thread {

    private static final String CONNECT = "CONNECT";
    private static final String HTTP_OK = "HTTP/1.1 200 OK\n";

    private static final String TAG = "ProxyServer";

    // HTTP Headers
    private static final String HEADER_CONNECTION = "connection";
    private static final String HEADER_PROXY_CONNECTION = "proxy-connection";

    private ExecutorService threadExecutor;

    public boolean mIsRunning = false;

    private ServerSocket serverSocket;
    private int mPort;
    private IProxyPortListener mCallback;
    private InetAddress bindAddress;

    private String socks5Host = "127.0.0.1";
    private int socks5Port = 1080;

    private class ProxyConnection implements Runnable {
        private static final int MAX_RETRY_COUNT = 3; // 最大重试次数
        private static final int RETRY_DELAY_MS = 2000; // 每次重试间隔时间（毫秒）

        private Socket connection;
        private InetAddress bindAddress;

        private ProxyConnection(Socket connection, InetAddress bindAddress) {
            this.connection = connection;
            this.bindAddress = bindAddress;
            Log.d(TAG, "ProxyConnection bindAddress: " + bindAddress);
        }

        @Override
        public void run() {
            Socket server = null;
            try {
                String requestLine = getLine(connection.getInputStream());
                String[] splitLine = requestLine.split(" ");
                if (splitLine.length < 3) {
                    connection.close();
                    return;
                }

                Log.v(TAG, " -> REQUEST: " + requestLine);

                String requestType = splitLine[0];
                String urlString = splitLine[1];
                String httpVersion = splitLine[2];

                URI url = null;
                String host;
                int port;

                if (requestType.equals(CONNECT)) {
                    String[] hostPortSplit = urlString.split(":");
                    host = hostPortSplit[0];
                    if (hostPortSplit.length < 2) {
                        port = 443;
                    } else {
                        try {
                            port = Integer.parseInt(hostPortSplit[1]);
                        } catch (NumberFormatException nfe) {
                            connection.close();
                            return;
                        }
                    }
                    urlString = "Https://" + host + ":" + port;
                } else {
                    try {
                        url = new URI(urlString);
                        host = url.getHost();
                        port = url.getPort();
                        if (port < 0) {
                            port = 80;
                        }
                    } catch (URISyntaxException e) {
                        connection.close();
                        return;
                    }
                }

                // 增加重试逻辑
                boolean connected = false;
                int retryCount = 0;
                while (!connected && retryCount < MAX_RETRY_COUNT) {
                    try {
                        server = new Socket(socks5Host, socks5Port);
                        connected = true;
                    } catch (IOException e) {
                        Log.d(TAG, "Failed to connect to SOCKS5 proxy, retrying...", e);
                        retryCount++;
                        if (retryCount < MAX_RETRY_COUNT) {
                            Thread.sleep(RETRY_DELAY_MS);
                        } else {
                            connection.close();
                            return;
                        }
                    }
                }

                // 进行 SOCKS5 握手
                if (!performSocks5Handshake(server, host, port)) {
                    connection.close();
                    server.close();
                    return;
                }

                // 转发 HTTP 请求到 SOCKS5 代理
                if (requestType.equals(CONNECT)) {
                    skipToRequestBody(connection);
                    sendLine(connection, HTTP_OK);
                } else {
                    sendAugmentedRequestToHost(connection, server, requestType, url, httpVersion);
                }

                // 通过 SOCKS5 代理转发响应
                SocketConnect.connect(connection, server);
            } catch (Exception e) {
                Log.d(TAG, "Problem Proxying", e);
            } finally {
                try {
                    if (connection != null && !connection.isClosed()) {
                        connection.close();
                    }
                    if (server != null && !server.isClosed()) {
                        server.close();
                    }
                } catch (IOException ioe) {
                    // Do nothing
                }
            }
        }

        private boolean performSocks5Handshake(Socket server, String host, int port) throws IOException {
            InputStream in = server.getInputStream();
            OutputStream out = server.getOutputStream();

            // 发送 SOCKS5 握手请求
            out.write(new byte[]{ 0x05, 0x01, 0x00 }); // SOCKS5, 1 authentication method, no authentication
            out.flush();

            // 读取 SOCKS5 握手响应
            byte[] response = new byte[2];
            int read = in.read(response);
            if (read != 2 || response[0] != 0x05 || response[1] != 0x00) {
                return false;
            }

            // 发送 SOCKS5 连接请求
            byte[] addressBytes = host.getBytes();
            byte[] connectRequest = new byte[7 + addressBytes.length];
            connectRequest[0] = 0x05; // SOCKS5
            connectRequest[1] = 0x01; // CONNECT
            connectRequest[2] = 0x00; // Reserved
            connectRequest[3] = 0x03; // Domain name
            connectRequest[4] = (byte) addressBytes.length; // Domain name length
            System.arraycopy(addressBytes, 0, connectRequest, 5, addressBytes.length);
            connectRequest[5 + addressBytes.length] = (byte) (port >> 8); // Port (high byte)
            connectRequest[6 + addressBytes.length] = (byte) (port & 0xFF); // Port (low byte)
            out.write(connectRequest);
            out.flush();

            // 读取 SOCKS5 连接响应
            response = new byte[10];
            read = in.read(response);
            return read == 10 && response[1] == 0x00;
        }

        private String getLine(InputStream inputStream) throws IOException {
            StringBuilder buffer = new StringBuilder();
            int byteBuffer = inputStream.read();
            if (byteBuffer < 0) return "";
            do {
                if (byteBuffer != '\r') {
                    buffer.append((char) byteBuffer);
                }
                byteBuffer = inputStream.read();
            } while ((byteBuffer != '\n') && (byteBuffer >= 0));

            return buffer.toString();
        }

        private void sendLine(Socket socket, String line) throws IOException {
            OutputStream os = socket.getOutputStream();
            os.write(line.getBytes());
            os.write('\r');
            os.write('\n');
            os.flush();
        }

        /**
         * Reads from socket until an empty line is read which indicates the end of HTTP headers.
         *
         * @param socket socket to read from.
         * @throws IOException if an exception took place during the socket read.
         */
        private void skipToRequestBody(Socket socket) throws IOException {
            while (getLine(socket.getInputStream()).length() != 0) ;
        }

        private void sendRequestLineWithPath(Socket server, String requestType, URI absoluteUri, String httpVersion) throws IOException {
            String absolutePath = getAbsolutePathFromAbsoluteURI(absoluteUri);
            String outgoingRequestLine = String.format("%s %s %s", requestType, absolutePath, httpVersion);
            sendLine(server, outgoingRequestLine);
        }

        private String getAbsolutePathFromAbsoluteURI(URI uri) {
            String rawPath = uri.getRawPath();
            String rawQuery = uri.getRawQuery();
            String rawFragment = uri.getRawFragment();
            StringBuilder absolutePath = new StringBuilder();

            if (rawPath != null) {
                absolutePath.append(rawPath);
            } else {
                absolutePath.append("/");
            }
            if (rawQuery != null) {
                absolutePath.append("?").append(rawQuery);
            }
            if (rawFragment != null) {
                absolutePath.append("#").append(rawFragment);
            }
            return absolutePath.toString();
        }

        private void sendAugmentedRequestToHost(Socket src, Socket dst, String httpMethod, URI uri, String httpVersion) throws IOException {
            sendRequestLineWithPath(dst, httpMethod, uri, httpVersion);
            filterAndForwardRequestHeaders(src, dst);

            // Currently the proxy does not support keep-alive connections; therefore,
            // the proxy has to request the destination server to close the connection
            // after the destination server sent the response.
            sendLine(dst, "Connection: close");

            // Sends and empty line that indicates termination of the header section.
            sendLine(dst, "");
        }

        /**
         * Forwards original request headers filtering out the ones that have to be removed.
         *
         * @param src source socket that contains original request headers.
         * @param dst destination socket to send the filtered headers to.
         * @throws IOException if the data cannot be read from or written to the sockets.
         */
        private void filterAndForwardRequestHeaders(Socket src, Socket dst) throws IOException {
            String line;
            do {
                line = getLine(src.getInputStream());
                if (line.length() > 0 && !shouldRemoveHeaderLine(line)) {
                    sendLine(dst, line);
                }
            } while (line.length() > 0);
        }

        /**
         * Returns true if a given header line has to be removed from the original request.
         *
         * @param line header line that should be analysed.
         * @return true if the header line should be removed and not forwarded to the destination.
         */
        private boolean shouldRemoveHeaderLine(String line) {
            int colIndex = line.indexOf(":");
            if (colIndex != -1) {
                String headerName = line.substring(0, colIndex).trim();
                return headerName.regionMatches(true, 0, HEADER_CONNECTION, 0, HEADER_CONNECTION.length())
                        || headerName.regionMatches(true, 0, HEADER_PROXY_CONNECTION, 0, HEADER_PROXY_CONNECTION.length());
            }
            return false;
        }
    }

    public ProxyServer() {
        threadExecutor = Executors.newCachedThreadPool();
        mPort = -1;
        mCallback = null;
    }

    @Override
    public void run() {
        try {
            serverSocket = new ServerSocket(ProxyService.PORT);

            setPort(serverSocket.getLocalPort());

            while (mIsRunning) {
                try {
                    Socket socket = serverSocket.accept();
                    // Only receive local connections.
                    if (!socket.getInetAddress().isLoopbackAddress()) {
                        ProxyConnection parser = new ProxyConnection(socket, bindAddress);
                        threadExecutor.execute(parser);
                    } else {
                        socket.close();
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } catch (SocketException e) {
            Log.e(TAG, "Failed to start proxy server", e);
        } catch (IOException e1) {
            Log.e(TAG, "Failed to start proxy server", e1);
        }

        mIsRunning = false;
    }

    public synchronized void setPort(int port) {
        if (mCallback != null) {
            try {
                mCallback.setProxyPort(port);
            } catch (RemoteException e) {
                Log.w(TAG, "Proxy failed to report port to PacManager", e);
            }
        }
        mPort = port;
    }

    public synchronized void setCallback(IProxyPortListener callback) {
        if (mPort != -1) {
            try {
                callback.setProxyPort(mPort);
            } catch (RemoteException e) {
                Log.w(TAG, "Proxy failed to report port to PacManager", e);
            }
        }
        mCallback = callback;
    }

    public synchronized void startServer(String interfaceName) {
        InetAddress bindAddress = DxNetworkUtil.getInetAddressByInterfaceName(interfaceName);
        if (bindAddress == null) {
            Log.e(TAG, "Failed to get bind address for interface: " + interfaceName);
        } else {
            Log.d(TAG, "bindAddress-> " + interfaceName + ": " + bindAddress);
        }
        mIsRunning = true;
        this.bindAddress = bindAddress;
        start();
    }

    public synchronized void stopServer() {
        mIsRunning = false;
        if (serverSocket != null) {
            try {
                serverSocket.close();
                serverSocket = null;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public boolean isBound() {
        return (mPort != -1);
    }

    public int getPort() {
        return mPort;
    }
}
