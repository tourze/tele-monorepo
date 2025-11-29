//
//  HttpResponseModel.swift

//
//  Created by  on 2019/9/9.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation
import HandyJSON

//request
class PageModel:HandyJSON
{
    var page=1;
    var pageSize = 100;
    required init() {}
}

class FeedbackModel:HandyJSON
{
    var content:String = ""
    required init() {}
}

class AuthRequestModel:HandyJSON
{
    var username:String?
    var password:String?
    var phoneModel:String?
    required init() {}
}

class  CaptchaRequestModel: HandyJSON {
    var username:String = ""
    var type:String = ""
    required init() {}
}

class RegisterModel:HandyJSON
{
    var username:String = ""
    var password:String = ""
    var passwordConfirmation:String = ""
    var captcha:String = ""
    var phoneModel:String = ""
    required init() {}
}

class ResetPasswordModel:HandyJSON
{
    var username:String = ""
    var password:String = ""
    var captcha:String = ""
    required init() {}
}

class TrialRequestModel:HandyJSON
{
    var imei: String?
    var phoneModel:String?
    required init() {}
}
class PayRequestModel:HandyJSON
{
    
    var goodsId = 0;
    var payChannel="";
    var quantity = 1;
    var method = "wap.H5"
    var channel_id:Int?
    
    required init() {}
}
class CheckAppVersionRequestModel:HandyJSON{
    var platform:String = ""
    var channel:String=""
    var appVersion:String=""
    var systemVersion:String=""
    var imei:String=""
    var versionCode:Int=0
    required init() {}
}

//response

class HttpResponseModel<T>:HandyJSON{
    var code:Int?
    var message:String?
    var status:String?
    var data: T?
    required init() {}
}
class QUser:HandyJSON
{
    var id:Int64?
    var status:Int?
    var paidUser:Bool = false
    var username:String?
    var phone:String?
    var subUrl:String?
    var totalTransfer:String?
    var expiredDate:String?
    var timeRemaining:Int?
    var vip :Int?
    var isTrial:Bool?
    var inviteCode:String = ""
    var inviteUrl:String = ""
    var inviteBy:String = ""
    var cardActive:Bool = false
    var flowRemaining:String = ""
    var channel = ""
    required init() {}
}
class BasicToken:HandyJSON
{
    var token:String?
    
    var expired_in:Int?
    
    var  user:QUser?
    required init() {}
}

class FlagsModel:HandyJSON
{
    var flags :String?
    var svgUrl :String?
    required init(){}
}

class Captcha:HandyJSON
{
    var hash:String?
    var base64:String?
    var sensitive:Bool?
    var code:String?
    required init() {}
}
class SmsRequestModel:HandyJSON {
    var phone:String = ""
    var hash:String=""
    var captcha:String=""
    required init() {}
}

class CheckAppVersion:HandyJSON
{
    var title:String?
    var content:String?
    var platform:String?
    var latestVersion:String?
    var appUrl:String?
    required init() {}
}

class Meta:HandyJSON
{
    var current_page = 0
    var last_page = 0
    var per_page = 0
    var total = 0
    required init() {}
}

class Product:HandyJSON {
    var id:Int?
    var title:String?
    var price:String?
    var priceStr: String?
    var content:String?
    var showPrice:String?
    var showPriceStr: String?
    var isTop:Bool?
    var isHot:Bool?
    var vip:Int?
    var production_id:String?
    required init() {}
}

class PostPayRespone:HandyJSON
{
    var url:String?
    var out_trade_no:String?
    var total = 0.0
    var orderNo = ""
    var quantity = 0
    var payChannel=Channels.WECHAT
    var payUrl = ""
    required init() {}
}

class ProfileServer:HandyJSON
{
    var name:String?
    var group:String?
    var flag:String?
    var ip:String?
    var method:String?
    var `protocol`:String?
    var protoparam:String?
    var obfs:String?
    var obfsparam:String?
    var passwd:String?
    var port:Int?
    var bandUsed:Float?
    var id:Int64?
    var delay:Int = -1
    var isTelescope:Bool = false
    var isGost: Bool?
    var gostProtocol: String?
    var loadNodes: String?
    var label: String?
    required init() {}
    
    func base64Encode(_ plainString: String) -> String! {
        if plainString.isEmpty {
            return ""
        }
        
        let plainData = plainString.data(using: String.Encoding.utf8)
        let base64String = plainData?.base64EncodedString(options: NSData.Base64EncodingOptions.init(rawValue: 0))
        
        return base64String
    }
    
    public var shareUrl: String {
        var tmpString = "\(ip ?? ""):\(port ?? 0):\(`protocol` ??  ""):\(method!):\(obfs ?? ""):\(base64Encode(passwd!).replacingOccurrences(of: "=", with: ""))/"
        tmpString = tmpString + "?obfsparam=\(base64Encode(obfsparam ?? "").replacingOccurrences(of: "=", with: ""))"
        tmpString = tmpString + "&protoparam=\(base64Encode(protoparam ?? "").replacingOccurrences(of: "=", with: ""))"
        tmpString = tmpString + "&remarks=\(base64Encode(name ?? "").replacingOccurrences(of: "=", with: ""))&group="
        
        return "ssr://\(base64Encode(tmpString).replacingOccurrences(of: "=", with: "").replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "+", with: "-"))"
    }
    
    static func fromDictionary(_ data:[String:AnyObject]) -> ProfileServer {
        let profile = ProfileServer()
        
        profile.ip = data["ServerHost"] as? String
        profile.port = Int((data["ServerPort"] as! NSNumber).uint16Value)
        profile.method = (data["Method"] as! String).lowercased()
        profile.passwd = data["Password"] as? String
        
        if let remark = data["Remark"] {
            profile.name = remark as? String
        }
        if let ssrObfs = data["ssrObfs"] {
            profile.obfs = (ssrObfs as! String).lowercased()
        }
        if let ssrObfsParam = data["ssrObfsParam"] {
            profile.obfsparam = ssrObfsParam as? String
        }
        if let ssrProtocol = data["ssrProtocol"] {
            profile.protocol = (ssrProtocol as! String).lowercased()
        }
        if let ssrProtocolParam = data["ssrProtocolParam"]{
            profile.protoparam = ssrProtocolParam as? String
        }
        
        
        if let flag = data["flag"] {
            profile.flag = flag as? String
        }
        
        profile.id = -Int64(Date().timeIntervalSince1970)
        
        return profile
    }
}


class FeedbackRecordResponse:HandyJSON
{
    var data:[FeedbackData]?
    var meta:Meta?
    required init() {}
}

class FeedbackData:HandyJSON
{
    var id:Int64? = 0
    var user_id:Int64? = 0
    var content:String?
    var created_at:String?
    var reply_id:Int64? = 0
    var reply_content:String?
    var reply_at:String?
    required init() {}
}

class RechargeRecord:HandyJSON
{
    var data:[Order]?
    var meta:Meta?
    required init() {}
}


class Order:HandyJSON
{
    var id:Int64?
    var orderNo:String?
    var outTradeNo:String?
    var escrowTradeNo:String?
    var quantity:Int?
    var unit_price:Int?
    var total:Int?
    var status:Int?
    var payChannel:String?
    var payTime:String?
    var createdAt:String?
    var orderItem:OrderProduct?
    required init() {}
}

class OrderProduct:HandyJSON
{
    var goodsId:String?
    var goodsName:String?
    required init() {}
}

class FaqResponseRecord:HandyJSON {
    var data:[FaqData]?
    var meta:Meta?
    required init() {}
}

class FaqData:HandyJSON{
    
    var ico:String?
    var question:String?
    var answer:String?
    required init() {}
    
}

class DomainModel: HandyJSON {
    var address: String?
    var isCNDomain: Bool = false
    required init() {}
}

class ChannelModel:HandyJSON {
    var channel_id:Int?
    var name:String?
    var channel:String?
    var enable:Bool = false
    required init() {}
}

class PayAppleModel:HandyJSON {
    var production_id: String?
    var quantity: Int?
    required init() {}
}

class ApplePayVerifyModel:HandyJSON {
    var orderNo: String?
    var originalTransactionId: String?
    var transactionId: String?
    var receiptData: String?
    required init() {}
}

class WebConfigModel:HandyJSON {
    var about :String?
    var homeUrl :String?
    var helpUrl :String?
    var email :String?
    var isRegiest = false
    var iosExternalNode = true  //是否允许使用第三方节点
    var regiestWay = ""
    var cardMoreUrl = ""
    var shareAction = false
    var iosExamine = false
    var inviteAddFlow = ""
    var inviteAddTime = ""
    required init(){}
}

class GWFListRequestModel: HandyJSON {
    
    var oldVersion :Int?
    required init() {
        
    }
}

class GWFListInfo: HandyJSON {
    var fileUrl:String?
    var version :Int?
    required init() {
        
    }
}

class CheckOrderStatusModel: HandyJSON {
    var outTradeNo:String?
    required init(){}
}

class InviteInfoReq:HandyJSON
{
    var inviteCode:String?
    required init() {}
}



class InviteInfo:HandyJSON{
    
    var create_time:String?
    var inviteCode:String?
    var getTime:Int?
    var userId:Int?
    required init() {}
    
}

class InviteInfoRecord:HandyJSON {
    var invite:[InviteInfo]?
    var totalNum:Int?
    var totalGetTime:Int?
    required init() {}
}


class AdModel:HandyJSON
{
    var title :String?
    var msgLink:String?
    var msgType:String?
    var msgTime:String?
    var contents:String?
    var read:Bool?
    required init() {}
}


class CouponRequestModel: HandyJSON {
    
    var card_number:String = ""
    var card_password:String = ""
    var channel = ""
    required init() {}
}

class CardActiveRecord: HandyJSON {
    
    var card_number:String = ""
    var card_status:String = ""
    var active_time:String = ""
    var expire_time:String = ""
    required init() {}
}

class HttpResult{
    public static let HTTP_OK = 200
    public static let HTTP_404 = 404
    public static let HTTP_403 = 403
    public static let HTTP_500 = 500
    public static let HTTP_ERROR = -1
    public static let HTTP_999 = 999
    public static let HTTP_998 = 998
    public static let HTTP_SERVER_NO_FOUND = -1003
    public static let HTTP_CAN_NOT_CONNECT = -1004
    public static let HTTP_NETWORK_NOT_CONNECT = -1009
    public static let HTTP_TIME_OUT = -1001
    public static let HTTP_SSL_CERTIFICATE_ERROR = -1200
    public static let UNAUTHORIZED_ERROR  = 401
}

enum HttpResponseType :Int
{
    case HttpGetEmailCaptcha
    case HttpResponseResult
    case HttpLoginSuccess
    case HttpUpdateUserInfoSuccess
    case HttpRefreshSuccess
    case HttpLoginFailed
}
