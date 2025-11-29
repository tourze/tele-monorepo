//
//   LocalModel.swift

//
//  Created by sysdlo on 2019/9/19.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation
import HandyJSON

class UserStatus {
    static let  NORMAL:Int  = 0
    static let  DISABLE:Int  = 1
    static let  EXPIRED:Int  = 2
    static let  TRAIL:Int  = 3
}

class Channels {
    
    static let ALIPAY:String = "alipay"
    static let WECHAT:String = "wechat"

}

class FaqModel: NSObject {
    var iconName :String = ""
    var title:String = ""
    var content:String = ""
    var isSelect:Bool = false
    var iconBase64:String = ""
    
    init(iconName:String,title:String,content:String,iconBase64:String = ""){
        self.iconName = iconName
        self.title = title
        self.content = content
        self.iconBase64 = iconBase64
    }
}

class FeedbackItemModel: NSObject{
    var isLeft:Bool? = true
    var timeText :String?=""
    var content:String? = ""
    
    init(isLeft:Bool,time:String,content:String){
        self.isLeft = isLeft
        self.timeText = time
        self.content = content
    }
}

class UserLoginData:HandyJSON
{
   var isAccountLogin:Bool = false
   var account:String = ""
   var password:String = ""

    func setData(flag:Bool,account:String,password:String){
           self.isAccountLogin = flag
           self.account = account
           self.password = password
       }
    required init() {}
}

class AuthUser:  HandyJSON{

    var id:Int64?
    var userName:String = ""
    var phone :String?
    var token:String?
    var expiredDate:String?
    var expiredIn:Int=0
    var status:Int = 0
    var paidUser:Bool = false
    var cardActive:Bool = false

    var isTrial:Bool = false
    var vip:Int = 0
    var inviteCode:String = ""
    var inviteUrl:String = ""
    var inviteBy:String = ""
    
    required init() {}
}
