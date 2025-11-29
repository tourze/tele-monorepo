package com.shadow.ssrclient.udp;
// 文件已迁移至库模块（react-native-shadowsocksr）

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import android.util.Log;

import sockslib.client.Socks5;
import sockslib.common.methods.NoAuthenticationRequiredMethod;

public class UdpServer {
    private static final String TAG = "UdpServer";
    private String ip;
    private int port;
    private DatagramSocket socket;
    private volatile boolean running;
    private ExecutorService executorService;
    private static ConcurrentHashMap<String, DatagramSocket> socketMap = new ConcurrentHashMap<>();  // 设为静态

    public UdpServer(String ip, int port) {
        this.ip = ip;
        this.port = port;
        this.executorService = Executors.newCachedThreadPool();
    }

    public UdpServer(String ipPort) {
        String[] parts = ipPort.split(":");
        if (parts.length == 2) {
            this.ip = parts[0];
            this.port = Integer.parseInt(parts[1]);
        } else {
            throw new IllegalArgumentException("Invalid IP:Port format");
        }
        this.executorService = Executors.newCachedThreadPool();
    }

    public void start() {
        new Thread(() -> {
            try {
                socket = new DatagramSocket(port, InetAddress.getByName(ip));
                running = true;
                Log.i(TAG, "UDP Server started on " + ip + ":" + port);

                while (running) {
                    byte[] buffer = new byte[2048]; // Increase buffer size to 2048 bytes
                    DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                    socket.receive(packet);
                    String packetId = UUID.randomUUID().toString();
                    Log.d(TAG, "Packet received with ID " + packetId + " from " + packet.getAddress() + ":" + packet.getPort());
                    Log.d(TAG, "Received data (hex) for packet ID " + packetId + ": " + bytesToHex(packet.getData(), packet.getLength()));
                    executorService.submit(new PacketHandler(packet, packetId));
                }
            } catch (IOException e) {
                if (running) {
                    Log.e(TAG, "Error in UDP Server", e);
                }
            } finally {
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
                Log.i(TAG, "UDP Server stopped on " + ip + ":" + port);
            }
        }).start();
    }

    private class PacketHandler implements Runnable {
        private DatagramPacket packet;
        private String packetId;

        public PacketHandler(DatagramPacket packet, String packetId) {
            this.packet = packet;
            this.packetId = packetId;
        }

        @Override
        public void run() {
            try {
                handlePacket(packet, packetId);
            } catch (IOException e) {
                Log.e(TAG, "Error handling packet with ID " + packetId, e);
            }
        }
    }

    private void handlePacket(DatagramPacket packet, String packetId) throws IOException {
        InetAddress fromAddress = packet.getAddress();
        int fromPort = packet.getPort();
        byte[] data = packet.getData();
        int length = packet.getLength();

        Log.d(TAG, "Handling packet with ID " + packetId
                + ", from " + fromAddress.getHostAddress() + ":" + fromPort
                + ", to " + ip + ":" + port
                + ", length: " + length);

        String key = fromAddress.getHostAddress() + ":" + fromPort;  // Use both source IP and port as the key
        DatagramSocket relaySocket = socketMap.computeIfAbsent(key, k -> {
            try {
                DatagramSocket newSocket = new DatagramSocket();
                executorService.submit(new RelaySocketHandler(newSocket, fromAddress, fromPort));
                return newSocket;
            } catch (SocketException e) {
                throw new RuntimeException(e);
            }
        });

        InetSocketAddress targetAddress = new InetSocketAddress(ip, port);

        Socks5 proxy = new Socks5(new InetSocketAddress("127.0.0.1", 1080));
        proxy.setAcceptableMethods(List.of(new NoAuthenticationRequiredMethod()));

        try {
            Log.d(TAG, "Building SOCKS5 connection for packet ID " + packetId);
            proxy.buildConnection();
            Log.d(TAG, "SOCKS5 connection built for packet ID " + packetId);
        } catch (IOException e) {
            Log.e(TAG, "Error building SOCKS5 connection for packet ID " + packetId, e);
            throw e;
        }

        InetSocketAddress relayServerAddress;
        try {
            Log.d(TAG, "Requesting UDP associate for packet ID " + packetId + " to " + ip + ":" + port);
            relayServerAddress = (InetSocketAddress) proxy.requestUdpAssociate(ip, port).getSocketAddress();
            Log.d(TAG, "UDP Relay server address for packet ID " + packetId + ": " + relayServerAddress);
        } catch (IOException e) {
            Log.e(TAG, "Error requesting UDP associate for packet ID " + packetId, e);
            throw e;
        }

        try {
            Log.d(TAG, "Sending data for packet ID " + packetId + " to relay server -> " + relayServerAddress.getAddress() + ":" + relayServerAddress.getPort());
            Log.d(TAG, "Local port used for packet ID " + packetId + " is " + relaySocket.getLocalPort());

            byte[] udpRequest = constructUdpRequest(targetAddress, data, length);
            Log.d(TAG, "Sending data (hex) for packet ID " + packetId + ": " + bytesToHex(udpRequest, udpRequest.length));
            DatagramPacket relayPacket = new DatagramPacket(udpRequest, udpRequest.length, relayServerAddress.getAddress(), relayServerAddress.getPort());
            relaySocket.send(relayPacket);
        } catch (IOException e) {
            Log.e(TAG, "Error during SOCKS5 UDP communication for packet ID " + packetId, e);
            throw e;
        }
    }

    private class RelaySocketHandler implements Runnable {
        private DatagramSocket relaySocket;
        private InetAddress clientAddress;
        private int clientPort;

        public RelaySocketHandler(DatagramSocket relaySocket, InetAddress clientAddress, int clientPort) {
            this.relaySocket = relaySocket;
            this.clientAddress = clientAddress;
            this.clientPort = clientPort;
        }

        @Override
        public void run() {
            byte[] buffer = new byte[2048]; // Increase buffer size to 2048 bytes
            while (true) {
                try {
                    DatagramPacket responsePacket = new DatagramPacket(buffer, buffer.length);
                    relaySocket.receive(responsePacket);
                    Log.d(TAG, "Received response (hex) from relay server: " + bytesToHex(responsePacket.getData(), responsePacket.getLength()));

                    // Unpack the SOCKS5 UDP response
                    byte[] responseData = responsePacket.getData();
                    if (responseData.length < 10) {
                        Log.e(TAG, "Invalid SOCKS5 UDP response, length too short");
                        continue;
                    }

                    // SOCKS5 UDP response header
                    byte reserved = responseData[0];
                    byte reserved2 = responseData[1];
                    byte fragment = responseData[2];
                    byte addressType = responseData[3];

                    int addressStartIndex;
                    InetAddress sourceAddress;
                    int sourcePort;

                    if (addressType == 1) { // IPv4
                        addressStartIndex = 4;
                        byte[] addressBytes = Arrays.copyOfRange(responseData, addressStartIndex, addressStartIndex + 4);
                        sourceAddress = InetAddress.getByAddress(addressBytes);
                        sourcePort = ((responseData[addressStartIndex + 4] & 0xFF) << 8) | (responseData[addressStartIndex + 5] & 0xFF);
                    } else {
                        Log.e(TAG, "Unsupported address type: " + addressType);
                        continue;
                    }

                    int dataStartIndex = addressStartIndex + 6;
                    byte[] data = Arrays.copyOfRange(responseData, dataStartIndex, responsePacket.getLength());

                    DatagramPacket forwardPacket = new DatagramPacket(data, data.length, clientAddress, clientPort);
                    socket.send(forwardPacket);
                    Log.d(TAG, "Forwarded response to original sender -> " + clientAddress + ":" + clientPort);
                } catch (IOException e) {
                    Log.e(TAG, "Error during receiving/forwarding from relaySocket", e);
                    break;
                }
            }
        }
    }

    private byte[] constructUdpRequest(InetSocketAddress targetAddress, byte[] data, int length) {
        byte[] header = new byte[10];
        header[0] = 0;
        header[1] = 0;
        header[2] = 0;
        header[3] = 1;

        byte[] addressBytes = targetAddress.getAddress().getAddress();
        System.arraycopy(addressBytes, 0, header, 4, addressBytes.length);

        int port = targetAddress.getPort();
        header[8] = (byte) (port >> 8);
        header[9] = (byte) (port & 0xFF);

        byte[] udpRequest = new byte[header.length + length];
        System.arraycopy(header, 0, udpRequest, 0, header.length);
        System.arraycopy(data, 0, udpRequest, header.length, length);

        return udpRequest;
    }

    private String bytesToHex(byte[] bytes, int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(String.format("%02x", bytes[i]));
            if (i < length - 1) {
                sb.append(" ");
            }
        }
        return sb.toString();
    }

    public void stop() {
        running = false;
        if (socket != null && !socket.isClosed()) {
            socket.close();
        }
        socketMap.values().forEach(DatagramSocket::close);
        Log.i(TAG, "UDP Server stopped on " + ip + ":" + port);
        executorService.shutdown();
    }
}
