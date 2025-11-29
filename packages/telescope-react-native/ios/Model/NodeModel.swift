//
//  NodeModel.swift
//  eliteulive
//
//  Created by Elite Edu on 2019/9/7.
//  Copyright © 2019 Ben. All rights reserved.
//

import UIKit


@objc open class NodeModel: NSObject {

    enum RechargeKey: String {
        case Id = "id"
        case Method = "method"
        case Port = "port"
        case Remarks = "remarks"
        case PProtocol = "protocol"
        case Protoparam = "protoparam"
        case Obfs = "obfs"
        case Flag = "flag"
        case Passwd = "passwd"
        case Obfsparam = "obfsparam"
        case Group = "group"
        case Ip = "ip"
        case IsServers = "isServers"
    }
    
    open var method: String?
    open var port: Int?
    open var remarks: String?
    open var pprotocol: String?
    open var protoparam: String?
    open var obfs: String?
    open var flag: String?
    open var passwd: String?
    open var obfsparam: String?
    open var ip: String?
    open var id: Int?
    open var isServers:Bool? //是后台服务器的节点

    
  @objc public init?(dic: Dictionary<String, Any>) {
        method = dic[RechargeKey.Method.rawValue] as? String
        port = dic[RechargeKey.Port.rawValue] as? Int
        remarks = dic[RechargeKey.Remarks.rawValue] as? String
        pprotocol = dic[RechargeKey.PProtocol.rawValue] as? String
        protoparam = dic[RechargeKey.Protoparam.rawValue] as? String
        obfs = dic[RechargeKey.Obfs.rawValue] as? String
        flag = dic[RechargeKey.Flag.rawValue] as? String
        passwd = dic[RechargeKey.Passwd.rawValue] as? String
        obfsparam = dic[RechargeKey.Obfsparam.rawValue] as? String
        ip = dic[RechargeKey.Ip.rawValue] as? String
        id = dic[RechargeKey.Id.rawValue] as? Int
        isServers = dic[RechargeKey.IsServers.rawValue] as? Bool
    }
    
    public override init() {
        
    }
}
