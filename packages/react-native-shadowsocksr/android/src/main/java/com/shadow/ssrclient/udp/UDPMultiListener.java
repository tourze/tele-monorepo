package com.shadow.ssrclient.udp;
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.util.Log;
import com.github.shadowsocks.utils.LogUtil;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UDPMultiListener {
    private static final String TAG = "UDPMultiListener";

    private static final int BUFFER_SIZE = 1024;
    private static final String SOCKS5_PROXY_HOST = "127.0.0.1";
    private static final int SOCKS5_PROXY_PORT = 1080;
    private static Map<String, DatagramSocket> socketMap = new HashMap<>();

    public static void startListeners(String[] ipAddresses, List<Integer> ports) {
        LogUtil.INSTANCE.d(TAG, "startListeners ipArray:" + Arrays.toString(ipAddresses));
        LogUtil.INSTANCE.d(TAG, "startListeners portArray:" + ports.toString());
        for (String ip : ipAddresses) {
            for (int port : ports) {
                try {
                    InetAddress address = InetAddress.getByName(ip);
                    DatagramSocket socket = new DatagramSocket(port, address);
                    socketMap.put(ip + ":" + port, socket);
                    LogUtil.INSTANCE.d(TAG, "Listening on UDP: " + ip + ":" + port);

                    // Start a new thread to listen on this socket
                    new Thread(() -> listenOnSocket(socket, ip, port)).start();
                } catch (Exception e) {
                    LogUtil.INSTANCE.e(TAG, ip + ":" + port + " Exception occurred -> " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
    }

    private static void listenOnSocket(DatagramSocket socket, String ip, int localPort) {
        byte[] buffer = new byte[BUFFER_SIZE];
        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

        Socks5Connection socks5Connection = null;

        try {
            while (!socket.isClosed()) {
                socket.receive(packet);
                String receivedData = new String(packet.getData(), 0, packet.getLength());
                Log.d(TAG, "Received from " + packet.getAddress() + ":" + packet.getPort() + " -> " + socket.getLocalSocketAddress() + ": " + receivedData);

                // Only connect to SOCKS5 proxy when data is received
                if (socks5Connection == null || socks5Connection.tcpSocket.isClosed()) {
                    socks5Connection = connectToSocks5Proxy(localPort, ip);
                }

                // Forward the received data to the SOCKS5 proxy
                forwardToSocks5Proxy(packet, socks5Connection, socket);
            }
        } catch (Exception e) {
            Log.e(TAG, "Exception in listenOnSocket: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
            if (socks5Connection != null) {
                socks5Connection.close();
            }
        }
    }

    private static Socks5Connection connectToSocks5Proxy(int localPort, String ip) throws IOException {
        Socks5Connection socks5Connection = new Socks5Connection();

        Log.d(TAG, "[" + ip + ":" + localPort + "] Connecting to SOCKS5 proxy at " + SOCKS5_PROXY_HOST + ":" + SOCKS5_PROXY_PORT);

        // Connect to SOCKS5 proxy
        socks5Connection.tcpSocket = new Socket(SOCKS5_PROXY_HOST, SOCKS5_PROXY_PORT);
        InputStream inputStream = socks5Connection.tcpSocket.getInputStream();
        OutputStream outputStream = socks5Connection.tcpSocket.getOutputStream();

        // Negotiate authentication method
        Log.d(TAG, "[" + ip + ":" + localPort + "] Negotiating SOCKS5 authentication method");
        outputStream.write(new byte[]{0x05, 0x01, 0x00}); // SOCKS5, 1 method, No authentication
        byte[] response = new byte[2];
        inputStream.read(response);
        if (response[1] != 0x00) {
            throw new IOException("[" + ip + ":" + localPort + "] SOCKS5 authentication failed");
        }

        // Send UDP association request
        Log.d(TAG, "[" + ip + ":" + localPort + "] Sending UDP association request to SOCKS5 proxy");
        outputStream.write(new byte[]{0x05, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
                (byte) (localPort >> 8 & 0xFF), (byte) (localPort & 0xFF)});
        byte[] udpResponse = new byte[10];
        inputStream.read(udpResponse);
        if (udpResponse[1] != 0x00) {
            throw new IOException("[" + ip + ":" + localPort + "] SOCKS5 UDP association failed");
        }

        // Extract UDP relay address and port
        socks5Connection.relayHost = SOCKS5_PROXY_HOST;
        socks5Connection.relayPort = ((udpResponse[8] & 0xFF) << 8) | (udpResponse[9] & 0xFF);

        Log.d(TAG, "[" + ip + ":" + localPort + "] UDP relay address: " + socks5Connection.relayHost + ", port: " + socks5Connection.relayPort);

        socks5Connection.udpSocket = new DatagramSocket();

        return socks5Connection;
    }

    private static void forwardToSocks5Proxy(DatagramPacket clientPacket, Socks5Connection socks5Connection, DatagramSocket clientSocket) {
        try {
            Log.d(TAG, "Forwarding data to SOCKS5 proxy from " + clientPacket.getAddress() + ":" + clientPacket.getPort());

            byte[] data = clientPacket.getData();
            int dataLength = clientPacket.getLength();
            InetAddress clientAddress = clientPacket.getAddress();
            int clientPort = clientPacket.getPort();

            // Construct SOCKS5 UDP packet
            byte[] header = new byte[10];
            header[0] = 0x00; // Reserved
            header[1] = 0x00; // Reserved
            header[2] = 0x00; // Fragment
            header[3] = 0x01; // Address type (IPv4)
            System.arraycopy(clientAddress.getAddress(), 0, header, 4, 4);
            header[8] = (byte) ((clientPort >> 8) & 0xFF);
            header[9] = (byte) (clientPort & 0xFF);

            byte[] udpRequest = new byte[header.length + dataLength];
            System.arraycopy(header, 0, udpRequest, 0, header.length);
            System.arraycopy(data, 0, udpRequest, header.length, dataLength);

            DatagramPacket udpPacket = new DatagramPacket(udpRequest, udpRequest.length, InetAddress.getByName(socks5Connection.relayHost), socks5Connection.relayPort);
            socks5Connection.udpSocket.send(udpPacket);

            Log.d(TAG, "Data forwarded to SOCKS5 proxy at " + socks5Connection.relayHost + ":" + socks5Connection.relayPort);

            // Listen for response from SOCKS5 proxy
            byte[] buffer = new byte[BUFFER_SIZE];
            DatagramPacket responsePacket = new DatagramPacket(buffer, buffer.length);
            socks5Connection.udpSocket.receive(responsePacket);

            Log.d(TAG, "Received response from SOCKS5 proxy at " + socks5Connection.relayHost + ":" + socks5Connection.relayPort);

            // Strip SOCKS5 UDP header
            int headerLength = 10; // Fixed header length for IPv4
            int responseLength = responsePacket.getLength() - headerLength;
            byte[] responseData = new byte[responseLength];
            System.arraycopy(responsePacket.getData(), headerLength, responseData, 0, responseLength);

            // Send the response back to the client
            DatagramPacket clientResponsePacket = new DatagramPacket(responseData, responseLength, clientPacket.getAddress(), clientPacket.getPort());
            clientSocket.send(clientResponsePacket);

            Log.d(TAG, "Response sent back to client at " + clientPacket.getAddress() + ":" + clientPacket.getPort());

        } catch (Exception e) {
            Log.e(TAG, "Error forwarding data to SOCKS5 proxy: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void stopListeners() {
        for (DatagramSocket socket : socketMap.values()) {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
        }
        socketMap.clear();
    }

    private static class Socks5Connection {
        Socket tcpSocket;
        DatagramSocket udpSocket;
        String relayHost;
        int relayPort;

        void close() {
            try {
                if (tcpSocket != null && !tcpSocket.isClosed()) {
                    tcpSocket.close();
                }
                if (udpSocket != null && !udpSocket.isClosed()) {
                    udpSocket.close();
                }
            } catch (IOException e) {
                Log.e(TAG, "Error closing Socks5Connection: " + e.getMessage());
            }
        }
    }
}
