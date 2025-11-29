//
//  LocalTools.swift

//
//  Created by  on 2019/9/15.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation


class LocalTools: NSObject {

    
    static let instance:LocalTools = LocalTools()
    
    
    var mainViewController:ShadowMainViewController? = nil
    var userIsLogOut = false
    
    fileprivate override init() {
     
    }
    
  
    //
    func getAuthUser()->AuthUser? {
        let authuser = AuthUser.deserialize(from: getObject(forKey: "authUser") as? String)
        return authuser
    }
    
    
    //*******
    func preparePay(model:Product?) {
        //mainWindowController?.choosePay(model:model)
    }
    
    
    
    func getUserInfo(authUser:AuthUser?) {
        let it = QUser()
        if(authUser != nil){
            it.id  = authUser!.id
            it.expiredDate = authUser?.expiredDate
            it.username = authUser?.userName
            it.status = authUser?.status
            it.phone = authUser?.phone
            it.paidUser = authUser!.paidUser
            it.cardActive = authUser!.cardActive
            it.inviteBy = authUser!.inviteBy
            it.inviteUrl = authUser!.inviteUrl
            it.inviteCode = authUser!.inviteCode
            it.isTrial = authUser!.isTrial
            it.vip = authUser!.vip
        }
        AppData.loggedUser = it
    }
    
    
    
    func saveAuthUser(basicToken:BasicToken){
    
        let authUser = AuthUser()
        authUser.expiredIn = basicToken.expired_in ?? 0
        authUser.token = basicToken.token
        if let it = basicToken.user {
            authUser.id = it.id
            authUser.expiredDate = it.expiredDate
            authUser.userName = it.username ?? ""
            authUser.status = it.status ?? 0
            authUser.phone = it.phone
            authUser.paidUser = it.paidUser
            authUser.cardActive = it.cardActive
            authUser.inviteBy = it.inviteBy
            authUser.inviteUrl = it.inviteUrl
            authUser.inviteCode = it.inviteCode
            authUser.isTrial = it.isTrial ?? false
            authUser.vip = it.vip ?? 0
            
            if let channel = Shadow.sharedUserDefaults().string(forKey: "channel") {
                if channel.isEmpty && it.channel.isEmpty == false{
                    Shadow.sharedUserDefaults().set(it.channel, forKey: "channel")
                }
            } else {
                if it.channel.isEmpty == false{
                    Shadow.sharedUserDefaults().set(it.channel, forKey: "channel")
                }
            }
        }
 
        AppData.authUser = authUser
        AppData.loggedUser = basicToken.user
        
        setValueForKey(key: "authUser",value:authUser.toJSONString())
    }
    
    func updateAuthUser(authUser: AuthUser,user:QUser? = nil)  {
        if let it = user {
            authUser.id = it.id
            authUser.expiredDate = it.expiredDate
            authUser.userName = it.username ?? ""
            authUser.status = it.status ?? 0
            authUser.phone = it.phone
            authUser.paidUser = it.paidUser
            authUser.cardActive = it.cardActive
            authUser.inviteBy = it.inviteBy
            authUser.inviteUrl = it.inviteUrl
            authUser.inviteCode = it.inviteCode
            authUser.isTrial = it.isTrial ?? false
            authUser.vip = it.vip ?? 0
            
            if let channel = Shadow.sharedUserDefaults().string(forKey: "channel") {
                if channel.isEmpty && it.channel.isEmpty == false{
                    Shadow.sharedUserDefaults().set(it.channel, forKey: "channel")
                }
            } else {
                if it.channel.isEmpty == false{
                    Shadow.sharedUserDefaults().set(it.channel, forKey: "channel")
                }
            }
            
        }
     
        AppData.authUser = authUser
        AppData.loggedUser = user
        setValueForKey(key: "authUser",value:authUser.toJSONString())
    }
    
  
    
    func exitApp() {
        //(NSApplication.shared.delegate as! AppDelegate).exitApp()
    }
    
    func getApiDomain() -> String{
        let defaults = UserDefaults.standard
        let domain = defaults.string(forKey: "ApiDomain")
        if(domain != nil && domain!.starts(with: "https:")){
            return domain!
        }else{
            return "https://\(HttpConfig.DEFAULT_DOMAIN)"
        }
    }
    func getAllDomains() -> String{
        let defaults = UserDefaults.standard
        let domains = defaults.string(forKey: "AllApiDomains")
        if(domains != nil && !domains!.isEmpty){
            return domains!
        }else{
            return HttpConfig.DEFAULT_DOMAIN
        }
    }
    
    func getAbout() -> String {
        let defaults = UserDefaults.standard
        let about = defaults.string(forKey: "About")
        return about ?? ""
    }
    
    func setValueForKey(key:String,value:Any?){
        let defaults = UserDefaults.standard
        defaults.set(value, forKey: key)
    }
    
    func getObject(forKey defaultName: String) -> Any?{
        return UserDefaults.standard.object(forKey: defaultName)
    }
    
    func getValueForKeyInt(key:String) -> Int{
        let defaults = UserDefaults.standard
        let value = defaults.integer(forKey: key)
        return value
    }
    
    func getValueForKeyString(key:String) -> String{
        let defaults = UserDefaults.standard
        let value = defaults.string(forKey: key)
        return value ?? ""
    }
    
    
    func getAdsFromLocal() -> [AdModel?] {
        let json = getValueForKeyString(key: "ads")
        if !json.isEmpty {
            if let res = [AdModel].deserialize(from: json) {
                return res
            }
        }
        
        return []
    }

    func getShadowNodeFromLocal() -> [ProfileServer?] {
        let json = getValueForKeyString(key: "shadowServerNodes")
        if !json.isEmpty {
            if let res = [ProfileServer].deserialize(from: json) {
                return res
            }
        }
        
        return []
    }
    
    func deleteAllShadowNodeFromLocal() {
        UserDefaults.standard.set("", forKey: "shadowServerNodes")
    }
    
    func getNormalNodeFromLocal() -> [ProfileServer?] {
        let json = getValueForKeyString(key: "normalServerNodes")
        if !json.isEmpty {
            if let res = [ProfileServer].deserialize(from: json) {
                return res
            }
        }
        
        return []
    }
    
    func autoSelectProfieServer() ->ProfileServer?{
        
        let shadowServers = getShadowNodeFromLocal()
//        let normalServers = LocalTools.instance.getNormalNodeFromLocal()
        
        if shadowServers.count > 0 {
            let model =  LocalTools.instance.GetAutoServer()
            selectedProfileServer(model: model)
            return model
            
        }
//        if normalServers.count > 0 {
//            for item in normalServers {
//                if item != nil{
//
//                    selectedProfileServer(model: item!)
//                    return item
//                }
//
//            }
//        }
        
        return nil
    }
    
    func selectedProfileServer(model:ProfileServer) {
        setValueForKey(key: "activiteProfile", value: model.toJSONString())
        
        if(model.isTelescope){
            LocalTools.instance.setValueForKey(key: "proxyToChina", value: false)
        }else{
            if(isIosExternalNode()){
                LocalTools.instance.setValueForKey(key: "proxyToChina", value: false)
            }else{
                LocalTools.instance.setValueForKey(key: "proxyToChina", value: true)
            }
        }
    }
    
    func isIosExternalNode() -> Bool {
        return AppData.webConfig?.iosExternalNode == true
    }
    
    func getActiviteProfile() -> ProfileServer? {
        let json = getValueForKeyString(key: "activiteProfile")
        if let res = ProfileServer.deserialize(from: json) {
            return res
        }
        return nil
    }
    
    func setAutoActiviteProfile() {
        setValueForKey(key: "activiteProfile", value: LocalTools.instance.GetAutoServer().toJSONString())
    }
    
    func getAutoIndexProfileByRemark(nodeRemark: String) -> ProfileServer? {
        let shadowServers = getShadowNodeFromLocal()
        
        for profile in shadowServers {
            if let remark = profile?.name {
                if remark == nodeRemark {
                    return profile
                }
            }
        }
        
        return nil
    }
    
    func  GetAutoIndex(servers:[ProfileServer])->ProfileServer?
    {
        if(servers.count==0){
            return nil
        }else{
            var index = -1
            var maxWeight:Float = 0
            for k in 0..<servers.count {
                let currentServer = servers[k]
                var currentWeight:Float = 0
                
                if let nodeName = currentServer.name {
                    if !nodeName.contains("_R_") {
                        debugPrint("非R节点,跳过")
                        continue
                    }
                }
                
                var delay = 10000

                if let ping = Manager.sharedManager.pingCheckDic[(currentServer.ip)! + String((currentServer.port)!)] as? Int {
                    delay = ping
                }
                
                if (delay > 300  || delay < 0)
                {
                    currentWeight = 0 + 6*currentServer.bandUsed!/100
                }
                else
                {
                    let value1 = 40 * (300.0 - Float(delay)) / 300.0
                    let value2 =  60 * (1 - currentServer.bandUsed! / 100.0)
                    currentWeight =  value1 + value2;
                }
                if (index == -1)
                {
                    index = 0;
                    maxWeight = currentWeight;
                }
                else
                {
                    if (currentWeight > maxWeight)
                    {
                        index = k;
                        maxWeight = currentWeight;
                    }
                }
                
                debugPrint("\(currentServer.name ?? ""), \((currentServer.ip) ?? "")")
                debugPrint("\(k) currentWeight:\(currentWeight), bandUsed:\(currentServer.bandUsed!), delay:\(delay), max:\(maxWeight), index:\(index)")
                
            }
            
            if(index >= 0){
                return servers[index]
            }else{
                return nil
            }
            
        }
    }
        
    
    func getNodeModelFromProfieServer(profileSever:ProfileServer) -> NodeModel {
        let model = NodeModel()
      
        model.remarks = profileSever.name
        model.ip = profileSever.ip
        model.method = profileSever.method
        
        model.obfs = profileSever.obfs
        model.obfsparam = profileSever.obfsparam
        model.passwd = profileSever.passwd
        model.port = profileSever.port
        model.pprotocol = profileSever.protocol
        model.protoparam = profileSever.protoparam
        
        return model
    }
    
    func deleteProfileSever(id:Int64?) {
        var normalListArray : Array<ProfileServer> = []
        let normalServers = LocalTools.instance.getNormalNodeFromLocal()
        if normalServers.count > 0{
            for item in normalServers {
                if item != nil && id != item?.id{
                    normalListArray.append(item!)
                }
                
            }
        }
        LocalTools.instance.setValueForKey(key: "normalServerNodes", value: normalListArray.toJSONString())
    }
    
    func getUserLoginData() -> UserLoginData {
        let json = getValueForKeyString(key: "user_login_data")
        if let res = UserLoginData.deserialize(from: json) {
            AppData.userLoginData.setData(flag: res.isAccountLogin, account: res.account, password: res.password)
        }
        return AppData.userLoginData
    }
    
    func setUserLoginData(flag:Bool = false,account:String = "",password:String = "") {
        AppData.userLoginData.setData(flag: flag, account: account, password: password)
        setValueForKey(key: "user_login_data", value: AppData.userLoginData.toJSONString())
    }
    
    
    func CreateError(msg:String) -> HttpResponseModel<String> {
        let result = HttpResponseModel<String>()
        result.code = -1
        result.status = "failed"
        result.message = msg
        return result
    }
    
    //"1.0.1"
    func CompareVersion( latestVersion:String,  version:String) ->Bool
           {
                  let version1 = latestVersion.split(separator: ".")
                  let version2 = version.split(separator: ".")
                  
                if (Int(version1[0])! > Int(version2[0])!)
                   {
                       return true;
                }
                   else if (Int(version1[0])! == Int(version2[0])! && Int(version1[1])! > Int(version2[1])!)
                   {
                       return true;
                  }
                   else if (Int(version1[0])! == Int(version2[0])! && Int(version1[1])! == Int(version2[1])! && Int(version1[2])! > Int(version2[3])!)
                   {
                       return true;
                  }
               
              
             
               return false;
           }
    
//    
    func GetAutoServer() -> ProfileServer {
        let auto = ProfileServer()
        auto.flag = "auto"
        auto.name = "自动选择最佳"
        auto.ip = "auto"
        auto.port = 110
        auto.id = -1
        return auto
    }
    
    private var useAuto:Bool = false
    
    private var chooseRemark:String = ""
    
    func SetChooseServerInfo(auto:Bool,remark:String) {
        useAuto = auto
        chooseRemark = remark
        
    }
    
    func GetChooseServerInfo() -> (auto: Bool, remark: String) {
        return (useAuto,chooseRemark)
    }
    
    func AccountCardActive()->Bool {
        let cardActive = Shadow.sharedUserDefaults().bool(forKey: "cardActive")
        if cardActive == false {
            Shadow.sharedUserDefaults().set(AppData.loggedUser?.cardActive, forKey: "cardActive")
        } else {
            //已经激活的用户,把隐藏功能都打开
            let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
            
            if iosExamine == false {
                Shadow.sharedUserDefaults().set(true, forKey: "iosExamine")
            }
        }
        
        
        return cardActive
    }
    
}
