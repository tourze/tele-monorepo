//
//  ApiService.swift

//
//  Created by  on 2020/9/16.
//  Copyright © 2020 qiuyuzhou. All rights reserved.
//

import Foundation
import Alamofire
import HandyJSON
import Async

let net_log = true
typealias httpOnSuccess<T> = (_ result:  HttpResponseModel<T>) -> Void
typealias httpOnFail = (_ result: String) -> Void
typealias httpOnErrorCode = (_ result: Int) -> Void

class ShadowApiService{
    static let instance:ShadowApiService = ShadowApiService()
    
    let sharedSessionManager: Alamofire.SessionManager = {
        let configuration = URLSessionConfiguration.default
       configuration.timeoutIntervalForRequest = 10
         return Alamofire.SessionManager(configuration: configuration)
     }()
    
    
    func CheckAppVersion(onSuccess:@escaping httpOnSuccess<CheckAppVersion>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)
    {
        
        HttpPost(url:HttpConfig.API_CHECK_APPVERSION, onSuccess:  onSuccess,onFail: onFail,token: token);
    }
    
    
    func TrailLogin(trialRequestModel:TrialRequestModel,onSuccess:@escaping httpOnSuccess<BasicToken>={ _ in },onFail:@escaping httpOnFail={_ in })
    {
        if(self.isChecking){
            onFail("is checking")
            return;
        }
        let datas = trialRequestModel.toJSONString()?.aesEncrypt() ?? ""
        HttpPostData(url:HttpConfig.API_POST_TRIAL_LOGIN, onSuccess: onSuccess,onFail: onFail,data: datas.data(using: String.Encoding.utf8)!);
    }
    
    func GetUserInfo(onSuccess:@escaping httpOnSuccess<QUser>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)
    {
       
        HttpPost(url:HttpConfig.API_GET_USERINFO, onSuccess: onSuccess,onFail: onFail,token:token);
    }
    

    
    func getWebConfig(onSuccess:@escaping httpOnSuccess<WebConfigModel>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)  {
        HttpPost(url: HttpConfig.API_CONFIG,onSuccess: onSuccess,onFail: onFail,token:token)
    }
    
    func GetGWFList(model:GWFListRequestModel, onSuccess:@escaping httpOnSuccess<GWFListInfo>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        let parameters = model.toJSON()
        HttpPost(url:HttpConfig.API_GFW_LIST, onSuccess:onSuccess, onFail:onFail,token: token,parameters:parameters);
    }
    
    
    func GetDomains(onSuccess:@escaping httpOnSuccess<[DomainModel]>={ _ in },onErrorCode:@escaping httpOnErrorCode={_ in },token:String? = nil)
    {
        HttpPost(url:HttpConfig.API_GET_DOMAINS, onSuccess: onSuccess,onErrorCode: onErrorCode,token: token);
    }

    
    func GetChannels(onSuccess:@escaping httpOnSuccess<[ChannelModel]>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        HttpPost(url:HttpConfig.API_GET_CHANNELS, onSuccess: onSuccess,onFail:  onFail,token:  token);
    }
    
    func CheckOrderStatus(out_trade_no:String, onSuccess:@escaping httpOnSuccess<String>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        let model = CheckOrderStatusModel()
        model.outTradeNo = out_trade_no
    
        let parameters = model.toJSON()
        HttpPost(url:HttpConfig.API_CHECK_ORDER, onSuccess:  onSuccess,onFail:  onFail,token:  token,parameters: parameters);
    }
    
    func getRechargeRecords(model:PageModel, onSuccess:@escaping httpOnSuccess<RechargeRecord>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        let parameters=model.toJSON()
        HttpPost(url:HttpConfig.API_GET_RECORDS, onSuccess:  onSuccess,onFail:  onFail,token: token,parameters: parameters);
    }

    func GetServers(onSuccess:@escaping httpOnSuccess<[ProfileServer]>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
      
        HttpPost(url:HttpConfig.API_GET_SERVERS, onSuccess:  onSuccess,onFail:  onFail,token:  token);
    }

    func GetFlags(onSuccess:@escaping httpOnSuccess<[FlagsModel]>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)  {
        HttpPost(url: HttpConfig.API_FLAGS, onSuccess: onSuccess,onFail: onFail,token:token)
    }

    func GetPay(payRequestModel:PayRequestModel,onSuccess:@escaping httpOnSuccess<PostPayRespone>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        let parameters = payRequestModel.toJSON()
        HttpPost(url:HttpConfig.API_GET_PAY, onSuccess:  onSuccess,onFail:  onFail,token: token,parameters: parameters);
    }
    
    func payApple(payAppleModel:PayAppleModel, onSuccess:@escaping httpOnSuccess<PostPayRespone>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        let parameters = payAppleModel.toJSON()
        HttpPost(url:HttpConfig.API_PAY_APPLE, onSuccess: onSuccess, onFail:  onFail,token: token,parameters: parameters);
    }
    
    func applePayVerify(applePayVerifyModel:ApplePayVerifyModel,onSuccess:@escaping httpOnSuccess<String>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        let parameters = applePayVerifyModel.toJSON()
        HttpPost(url:HttpConfig.API_APPLE_PAY_VERIFY, onSuccess:  onSuccess,onFail:  onFail,token: token,parameters: parameters);
    }
   
    func GetSms(smsRequestModel:SmsRequestModel,onSuccess:@escaping httpOnSuccess<String>={ _ in },onFail:@escaping httpOnFail={_ in })
    {
//        let parameters = ["phonte":phone,"captcha":captcha.code ?? "","hash":captcha.hash ?? ""];
        let parameters = smsRequestModel.toJSON()
        HttpPost(url:HttpConfig.API_GET_SMS, onSuccess: onSuccess,onFail: onFail,parameters:parameters);
    }

    func RegisterAccount(registerModel:RegisterModel,onSuccess:@escaping httpOnSuccess<BasicToken>={ _ in },onFail:@escaping httpOnFail={_ in })
    {
        let parameters = registerModel.toJSON()
        HttpPost(url:HttpConfig.API_POST_BIND_ACCOUNT, onSuccess: onSuccess,onFail: onFail,parameters:parameters);
    }
    
    func ResetAccountPassword(resetPasswordModel:ResetPasswordModel,onSuccess:@escaping httpOnSuccess<String>={ _ in },onFail:@escaping httpOnFail={_ in })
    {
        let parameters = resetPasswordModel.toJSON()
        HttpPost(url:HttpConfig.API_POST_RESET_PASSWORD, onSuccess: onSuccess,onFail: onFail,parameters:parameters);
    }

    func GetCaptcha(model:CaptchaRequestModel,onSuccess:@escaping httpOnSuccess<Captcha>={ _ in },onFail:@escaping httpOnFail={_ in }){
        
        let datas = model.toJSONString()?.aesEncrypt() ?? ""
        HttpPostData(url:HttpConfig.API_GET_CAPTCHA, onSuccess: onSuccess,onFail: onFail,data: datas.data(using: String.Encoding.utf8)!);
       
    }

    func GetProducts(onSuccess:@escaping httpOnSuccess<[Product]>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)
    {
        HttpPost(url:HttpConfig.API_GET_PRODUCT, onSuccess: onSuccess,onFail: onFail,token:token);
    }
    
    func GetAD(onSuccess:@escaping httpOnSuccess<[AdModel]>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)
    {
        HttpPost(url:HttpConfig.API_AD, onSuccess: onSuccess,onFail: onFail,token:token);
    }

    func BasicLogin(authRequestModel:AuthRequestModel,onSuccess:@escaping httpOnSuccess<BasicToken>={ _ in },onFail:@escaping httpOnFail={_ in })
    {
        
        let datas = authRequestModel.toJSONString()?.aesEncrypt() ?? ""
        HttpPostData(url:HttpConfig.API_POST_LOGIN, onSuccess: onSuccess,onFail: onFail,data: datas.data(using: String.Encoding.utf8)!);
        
    }


    func userActiveByCard(model:CouponRequestModel,onSuccess:@escaping httpOnSuccess<String>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)
    {
        let datas = model.toJSONString()?.aesEncrypt() ?? ""
        HttpPostData(url:HttpConfig.API_CARD_ACTIVE, onSuccess: onSuccess,onFail: onFail,token:token,data: datas.data(using: String.Encoding.utf8)!)
    }
    
    func GetInviteInfo(onSuccess:@escaping httpOnSuccess<InviteInfoRecord>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)
    {
        
        HttpPost(url:HttpConfig.API_INVITE_INFO, onSuccess: onSuccess,onFail: onFail,token:token);
    }

    func BindInvite(inviteReq:InviteInfoReq, onSuccess:@escaping httpOnSuccess<String>={ _ in },onFail:@escaping httpOnFail={_ in }, token:String? = nil)
    {
        let parameters = inviteReq.toJSON()
        HttpPost(url:HttpConfig.API_INVITE_ACTIVE, onSuccess:  onSuccess,onFail:  onFail,token: token,parameters: parameters);
    }
    
    func CardActiveRecord(onSuccess:@escaping httpOnSuccess<[CardActiveRecord]>={ _ in },onFail:@escaping httpOnFail={_ in },token:String? = nil)
    {
        HttpPost(url: HttpConfig.API_CARD_RECORD,onSuccess: onSuccess,onFail: onFail,token: token)
    }
    
    func HttpPost<T>(url:String,onSuccess:@escaping httpOnSuccess<T>={ _ in },
                     onFail:@escaping httpOnFail={_ in },onErrorCode:@escaping httpOnErrorCode={_ in },token:String?=nil,
                     parameters:Parameters? = nil) {
        
        let headers = GetHeaders(token: token)
        
        sharedSessionManager.request(url,method: .post,parameters:parameters,headers:headers).responseJSON{response in
            switch response.result {
            case .success:
                let resultData = String(data: response.data!, encoding: String.Encoding.utf8)
                if(net_log){
                    print(resultData!+","+url)
                }
                if let res = HttpResponseModel<T>.deserialize(from: resultData) {
                    onSuccess(res)
                }
                
            case .failure(let error):
                let code = error._code
                onFail("error:\(error),\(code)")
                print("http statusCode: \(response.response?.statusCode ?? -1000)  error:\(error),\(code)")
                self.checkDomain();
                
                //                 if(code == HttpResult.HTTP_SERVER_NO_FOUND || code == HttpResult.HTTP_TIME_OUT || code == HttpResult.HTTP_SSL_CERTIFICATE_ERROR){
                //                 }
                onErrorCode(code)
                
            }
            
        }
    }
    
    
    func HttpPostData<T>(url:String,onSuccess:@escaping httpOnSuccess<T>={ _ in },
                     onFail:@escaping httpOnFail={_ in },onErrorCode:@escaping httpOnErrorCode={_ in },token:String?=nil,
                     data:Data? = nil) {
        
        let headers = GetHeaders(token: token)
        
        sharedSessionManager.upload(data ?? Data(), to: url, method: .post, headers: headers).responseJSON{response in
            switch response.result {
               case .success:
                let resultData = String(data: response.data!, encoding: String.Encoding.utf8)
                if(net_log){
                    print(resultData!+","+url)
                }
                if let res = HttpResponseModel<T>.deserialize(from: resultData) {
                    onSuccess(res)
                }
                
              case .failure(let error):
                 let code = error._code
                 onFail("error:\(error),##,\(code)")
                self.checkDomain();

//                if(code == HttpResult.HTTP_SERVER_NO_FOUND ||
//                   code == HttpResult.HTTP_TIME_OUT ||
//                   code == HttpResult.HTTP_SSL_CERTIFICATE_ERROR ||
//                   code == HttpResult.HTTP_CAN_NOT_CONNECT){
//                 }
                onErrorCode(code)
              
            }
            
        }
    }
    
    
    
    func HttpGet<T>(url:String,onSuccess:@escaping httpOnSuccess<T>={ _ in },
                     onFail:@escaping httpOnFail={_ in },onErrorCode:@escaping httpOnErrorCode={_ in },token:String?=nil,
                     parameters:Parameters? = nil) {
        
        let headers = GetHeaders(token: token)
        
        Alamofire.request(url,method: .get,parameters:parameters,headers:headers).responseJSON{response in
            switch response.result {
            case .success:
                let resultData = String(data: response.data!, encoding: String.Encoding.utf8)
                if(net_log){
                    print(resultData!+","+url)
                }
                if let res = HttpResponseModel<T>.deserialize(from: resultData) {
                    onSuccess(res)
                }
            case .failure(let error):
             
                let code = error._code
                onFail("error:\(error),\(code)")
                 if(code == HttpResult.HTTP_SERVER_NO_FOUND || code == HttpResult.HTTP_SSL_CERTIFICATE_ERROR){
                    self.checkDomain();
                }
                onErrorCode(code)
                
            }
            
        }
    }
    
    func GetHeaders(token:String?=nil) -> HTTPHeaders {
        
        var channel = "GW"
        if let appChannel = Shadow.sharedUserDefaults().string(forKey: "channel") {
            channel = appChannel
        }
        if(token == nil || (token?.isEmpty == true)){
            let headers: HTTPHeaders = [
                "appVersion":SystemUtil.appVersion,
                "appBuild":String(SystemUtil.appBuild),
                "channel": channel,
                "imei":SystemUtil.imei,
                "systemVersion":SystemUtil.systemVersion,
                "platform":SystemUtil.platform,
                "Accept": "application/json"
            ]
            return headers
        }else{
            let headers: HTTPHeaders = [
                "appVersion":SystemUtil.appVersion,
                "appBuild":String(SystemUtil.appBuild),
                "channel": channel,
                "imei":SystemUtil.imei,
                "systemVersion":SystemUtil.systemVersion,
                "platform":SystemUtil.platform,
                "Authorization": "Token \(token ?? "")",
                "Accept": "application/json"
            ]
            return headers
        }
    }
    
    func HttpGetFileUrl(url:String,onSuccess:@escaping httpOnSuccess<Data>={ _ in },
                        onFail:@escaping httpOnFail={_ in }) {
        Alamofire.request(url,method: .get).responseData{response in
            switch response.result {
            case .success:
                let result = HttpResponseModel<Data>()
                result.code =  response.response?.statusCode
                result.data = response.data
                onSuccess(result)
            case .failure:
                onFail("failure")
            }
            
        }
    }
    var isChecking = false
    var canNotFindAnyDomainCanUse = false
    func checkDomain(){
        if(isChecking || canNotFindAnyDomainCanUse){
            return;
        }
        isChecking = true;
        if let app = UIApplication.shared.delegate, let window = app.window {
            //window?.rootViewController?.showProgreeHUD("网络优化中,请稍后...")
        }
        let domain = LocalTools.instance.getApiDomain()
        let internalData = HttpConfig.INTERNAL_DOMAINS.split(separator: ",")
        let allDomains = LocalTools.instance.getAllDomains().split(separator: ",")
        var useDomain = domain
        var isFind = false
        DispatchQueue.global().async {
            for item in allDomains {
                let newDomain = "https://\(item)"
                isFind = self.isActiveDomain(domain: newDomain)
                if(isFind){
                    useDomain = newDomain
                    break
                }
            }
            if(!isFind){
                for item in internalData {
                    let newDomain = "https://\(item)"
                    isFind = self.isActiveDomain(domain: newDomain)
                    if(isFind){
                        useDomain = newDomain
                        break
                    }
                }
            }
            print("use the domain is \(useDomain)")
            
            self.isChecking = false
            
            Async.main{
                if let app = UIApplication.shared.delegate, let window = app.window {
                    if(!isFind){
                        self.canNotFindAnyDomainCanUse = true
                        window?.rootViewController?.showTextHUD("优化失败,请尝试切换4G或者wifi再试", dismissAfterDelay: 2)
                    } else {
                        window?.rootViewController?.showTextHUD("优化完成", dismissAfterDelay: 1.5)
                        if AppData.webConfig == nil {
                            LocalTools.instance.mainViewController?.getWebConfig()
                        }
                        //网络优化完成,如果没有登录的话,自动登录一次
                        if AppData.loggedUser == nil {
                            let userLoginData = LocalTools.instance.getUserLoginData()
                            if(userLoginData.isAccountLogin){
                                LocalTools.instance.mainViewController?.isAutoLogining = true
                                LocalTools.instance.mainViewController?.basicLogin(userLoginData.account, userLoginData.password)
                            }else{
                                LocalTools.instance.mainViewController?.goTrial()
                            }
                        }
                    }
                }
            }
            
        }
        
    }
    
    
    private func isActiveDomain(domain:String)->Bool {
        var isFind = false
        var isWaiting = true
        HttpConfig.resetDomain(domain: domain)
        
        ShadowApiService.instance.GetAD(onSuccess: { result in
            isFind = true
            isWaiting = false
            
        }, onFail: { code in
            debugPrint(code)
            isWaiting = false
        })
        
        while isWaiting {
            RunLoop.current.run(mode: RunLoop.Mode.default, before: Date.distantFuture)
        }
        return isFind
    }
}
