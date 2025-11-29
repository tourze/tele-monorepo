import Foundation
import NetworkExtension

/// TUN interface provide a scheme to register a set of IP Stacks (implementing `IPStackProtocol`) to process IP packets from a virtual TUN interface.
open class TUNInterface: NSObject {
    @objc public weak var packetFlow: NEPacketTunnelFlow?
    fileprivate var stacks: [IPStackProtocol] = []
    
    /**
     Initialize TUN interface with a packet flow.
     
     - parameter packetFlow: The packet flow to work with.
     */
    public override init() {
    }
    
    
    @objc func startDnsServer() {
        let fakeIPPool = try! IPPool(range: IPRange(startIP: IPAddress(fromString: "198.19.1.1")!, endIP: IPAddress(fromString: "198.19.255.255")!))
        
        let dnsServer = DNSServer(address: IPAddress(fromString: "8.8.8.8")!, port: Port(port: 53), fakeIPPool: fakeIPPool)
        let resolver = UDPDNSResolver(address: IPAddress(fromString: "223.5.5.5")!, port: Port(port: 53))

        dnsServer.registerResolver(resolver)
        register(stack: dnsServer)
        
        DNSServer.currentServer = dnsServer
        
        start()
    }
    /**
     Start processing packets, this should be called after registering all IP stacks.
     
     A stopped interface should never start again. Create a new interface instead.
     */
    open func start() {
        QueueFactory.executeOnQueueSynchronizedly {
            for stack in self.stacks {
                stack.start()
            }
            
        }
    }
    
    /**
     Stop processing packets, this should be called before releasing the interface.
     */
    @objc open func stop() {
        QueueFactory.executeOnQueueSynchronizedly {
            
            for stack in self.stacks {
                stack.stop()
            }
            self.stacks = []
        }
    }
    
    @objc func findFakeIPDomain(ipv4InNetworkOrder: UInt32) -> String {
        
        let address = IPAddress(ipv4InNetworkOrder: ipv4InNetworkOrder)
        /// If custom DNS server is set up.
        guard let dnsServer = DNSServer.currentServer else {
            return ""
        }
        
        guard dnsServer.isFakeIP(address) else {
            return ""
        }
        
        // Look up fake IP reversely should never fail.
        guard let session = dnsServer.lookupFakeIP(address) else {
            return ""
        }
        
        let fakeIphost = session.requestMessage.queries[0].name
        
        return fakeIphost
    }
    
    /**
     Register a new IP stack.
     
     When a packet is read from TUN interface (the packet flow), it is passed into each IP stack according to the registration order until one of them takes it in.
     
     - parameter stack: The IP stack to append to the stack list.
     */
    open func register(stack: IPStackProtocol) {
        QueueFactory.executeOnQueueSynchronizedly {
            stack.outputFunc = self.generateOutputBlock()
            self.stacks.append(stack)
        }
    }
    
    @objc open func readPacket(packet: Data, version: NSNumber?) -> Bool {
//        NSLog("tuninterface read dns packet")
        
        if self.stacks[0].input(packet: packet, version: version) {
            return true
        } else {
            return false
        }
    }
    
    fileprivate func generateOutputBlock() -> ([Data], [NSNumber]) -> Void {
        return { [weak self] packets, versions in
            self?.packetFlow?.writePackets(packets, withProtocols: versions)
        }
    }
}
