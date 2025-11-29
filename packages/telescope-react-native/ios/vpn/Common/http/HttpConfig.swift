//
//  HttpConfig.swift
//  SSRClient
//
//  Created by  on 2019/9/9.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation

enum ProxyMode: Int{
    case Direct
    case Pac
    case PacChnOnly
    case Global
}

public let GET_PRODUCT = "v5/goods/";
public let GET_USERINFO = "v5/user/";
public let POST_LOGIN = "v5/login/";
public let POST_RESET_PASSWORD = "v5/forget_password/";
public let POST_BIND_ACCOUNT = "v5/user/sure/";
public let POST_TRIAL_LOGIN = "v5/trial/";
public let GET_SERVERS = "v5/nodes/";
public let GET_PAY = "v5/pay/";
public let GET_RECORDS = "v5/pay/pay/recharge_record/";
public let GET_CAPTCHA = "v5/captcha_send/";
public let GET_SMS = "v5/sms";
public let CHECK_ORDER = "v5/pay/pay/check/";
public let GET_CHANNELS = "v5/pay/pay/channel/";
public let CHECK_APPVERSION = "v5/check_version/";
public let GET_AD = "v5/ad/";
public let FEEDBACK_ADD = "v5/feedback/add";
public let FEEDBACK_LIST = "v5/feedback/list";
public let GET_DOMAINS = "v5/domains/"
public let GET_CONFIG = "v5/config/";
public let GFW_LIST = "v5/gfw_list/";
public let INVITE_INFO = "v5/invite/info/";
public let INVITE_ACTIVE = "v5/invite/active/";
public let CARD_RECORD_INFO = "v5/card/record/";
public let CARD_ACTIVE = "v5/card/active/";
public let CLINET_INFO = "v5/user/client_info/";
public let GET_FLAGS = "v5/flags/";
public let PAY_APPLE = "v5/pay_apple/";
public let APPLE_PAY_VERIFY = "v5/apple_verify/";


class HttpConfig:NSObject{
    
    public static var CARD_ACTIVE_KEY = "card_active_key"
    
    public static var API_HOST = "https://api-2.quickg.cc"
    
    public static let DEFAULT_DOMAIN = "api-2.quickg.cc"
    
    public static let INTERNAL_DOMAINS = "api-2.quickg.cc,nx-api-01.telescoep2.vip,nx-api-02.telescoep2.vip,music.telescope1.vip"
    
    public static var API_BASE_URL = "\(API_HOST)/api/";
    
    public static var API_GET_PRODUCT = HttpConfig.API_BASE_URL + GET_PRODUCT;
    
    public static var API_GET_USERINFO = HttpConfig.API_BASE_URL + GET_USERINFO;
    
    public static var API_POST_LOGIN = HttpConfig.API_BASE_URL + POST_LOGIN;
        
    public static var API_POST_RESET_PASSWORD = HttpConfig.API_BASE_URL + POST_RESET_PASSWORD;
    
    public static var API_POST_BIND_ACCOUNT = HttpConfig.API_BASE_URL + POST_BIND_ACCOUNT;
    
    public static var API_POST_TRIAL_LOGIN = HttpConfig.API_BASE_URL + POST_TRIAL_LOGIN;
    
    public static var API_GET_SERVERS = HttpConfig.API_BASE_URL + GET_SERVERS;
    
    public static var API_GET_PAY = HttpConfig.API_BASE_URL + GET_PAY;
    
    public static var API_GET_RECORDS = HttpConfig.API_BASE_URL + GET_RECORDS;
    
    public static var API_GET_CAPTCHA = HttpConfig.API_BASE_URL + GET_CAPTCHA;
    
    public static var API_GET_SMS = HttpConfig.API_BASE_URL + GET_SMS;
    
    public static var API_CHECK_ORDER = HttpConfig.API_BASE_URL + CHECK_ORDER;
    
    public static var API_GET_CHANNELS = HttpConfig.API_BASE_URL + GET_CHANNELS;
    
    public static var API_CHECK_APPVERSION = HttpConfig.API_BASE_URL + CHECK_APPVERSION;
    
    public static var API_AD = HttpConfig.API_BASE_URL + GET_AD;
    
    
    
    public static var API_GET_DOMAINS = HttpConfig.API_BASE_URL + GET_DOMAINS
    
    
    
    public static var API_CONFIG = HttpConfig.API_BASE_URL + GET_CONFIG;
    
    public static var API_GFW_LIST = HttpConfig.API_BASE_URL + GFW_LIST;
    
    public static var API_INVITE_INFO = HttpConfig.API_BASE_URL + INVITE_INFO;

    public static var API_INVITE_ACTIVE = HttpConfig.API_BASE_URL + INVITE_ACTIVE;
    
    public static var API_CARD_ACTIVE = HttpConfig.API_BASE_URL + CARD_ACTIVE
    
    
    public static var API_CARD_RECORD = HttpConfig.API_BASE_URL + CARD_RECORD_INFO
    
    public static var API_FLAGS = HttpConfig.API_BASE_URL + GET_FLAGS;
    public static var API_PAY_APPLE = HttpConfig.API_BASE_URL + PAY_APPLE;
    public static var API_APPLE_PAY_VERIFY = HttpConfig.API_BASE_URL + APPLE_PAY_VERIFY;

    // 下面2个是新的,版本号升级到2.0.0后使用
    public static var sKey = "liOD1j7M9Lsvs2tXhrxgHZOiJn5dY60S"//key，可自行修改
    public static var ivParameter = "RmocrQkgcKgRd36S"//偏移量,可自行修改
    
    
    public static var DOWNLOAD_TITLE = "download_app"
    
    
    static func resetDomain(domain:String){
        var newdomain = domain
        if(domain.starts(with: "https://https://")){
            newdomain = newdomain.replacingOccurrences(of: "https://https://",with: "https://")
        }
        else if(domain.starts(with: "https://")){
            newdomain = domain
        }else{
            newdomain = "https://\(domain)"
        }
        API_HOST = newdomain
        
        API_BASE_URL = "\(API_HOST)/api/";
        
        API_GET_PRODUCT = HttpConfig.API_BASE_URL + GET_PRODUCT;
        
        API_GET_USERINFO = HttpConfig.API_BASE_URL + GET_USERINFO;
        
        API_POST_LOGIN = HttpConfig.API_BASE_URL + POST_LOGIN;
        
        
        API_POST_RESET_PASSWORD = HttpConfig.API_BASE_URL + POST_RESET_PASSWORD;
        
        API_POST_BIND_ACCOUNT = HttpConfig.API_BASE_URL + POST_BIND_ACCOUNT;
        
        API_POST_TRIAL_LOGIN = HttpConfig.API_BASE_URL + POST_TRIAL_LOGIN;
        
        API_GET_SERVERS = HttpConfig.API_BASE_URL + GET_SERVERS;
        
        API_GET_PAY = HttpConfig.API_BASE_URL + GET_PAY;
        
        API_GET_RECORDS = HttpConfig.API_BASE_URL + GET_RECORDS;
        
        API_GET_CAPTCHA = HttpConfig.API_BASE_URL + GET_CAPTCHA;
        
        API_GET_SMS = HttpConfig.API_BASE_URL + GET_SMS;
        
        API_CHECK_ORDER = HttpConfig.API_BASE_URL + CHECK_ORDER;
        
        API_GET_CHANNELS = HttpConfig.API_BASE_URL + GET_CHANNELS;
        
        API_CHECK_APPVERSION = HttpConfig.API_BASE_URL + CHECK_APPVERSION;
        
        API_AD = HttpConfig.API_BASE_URL + GET_AD;
        
        
        API_GET_DOMAINS = HttpConfig.API_BASE_URL + GET_DOMAINS
        
        
        API_CONFIG = HttpConfig.API_BASE_URL + GET_CONFIG;
        
        API_GFW_LIST = HttpConfig.API_BASE_URL + GFW_LIST;
        
        API_INVITE_INFO = HttpConfig.API_BASE_URL + INVITE_INFO;
    
        API_INVITE_ACTIVE = HttpConfig.API_BASE_URL + INVITE_ACTIVE;
        
        API_CARD_ACTIVE = HttpConfig.API_BASE_URL + CARD_ACTIVE
        
        
        API_CARD_RECORD = HttpConfig.API_BASE_URL + CARD_RECORD_INFO
        
        API_FLAGS = HttpConfig.API_BASE_URL + GET_FLAGS;
        API_PAY_APPLE = HttpConfig.API_BASE_URL + PAY_APPLE;
        API_APPLE_PAY_VERIFY = HttpConfig.API_BASE_URL + APPLE_PAY_VERIFY;

        let defaults = UserDefaults.standard
        defaults.set(domain, forKey: "ApiDomain")
    }
    
    
    static func loadUserDefaults(){
        // Prepare defaults
        let defaults = UserDefaults.standard
        
        defaults.register(defaults: [
            "lastProxyMode": ProxyMode.Pac.rawValue,
            "ProxyMode": ProxyMode.Direct.rawValue,
            "LocalSocks5.ListenPort": NSNumber(value: 1090 as UInt16),
            "LocalSocks5.ListenAddress": "127.0.0.1",
            "PacServer.ListenAddress": "127.0.0.1",
            "PacServer.ListenPort":NSNumber(value: 8090 as UInt16),
            "LocalSocks5.Timeout": NSNumber(value: 60 as UInt),
            "LocalSocks5.EnableUDPRelay": NSNumber(value: false as Bool),
            "LocalSocks5.EnableVerboseMode": NSNumber(value: false as Bool),
            "GFWListURL": "https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt",
            "ACLWhiteListURL": "https://raw.githubusercontent.com/shadowsocksr/shadowsocksr-libev/master/acl/chn.acl",
            "ACLAutoListURL": "https://raw.githubusercontent.com/shadowsocksr/shadowsocksr-libev/master/acl/gfwlist.acl",
            "ACLProxyBackCHNURL":"https://raw.githubusercontent.com/shadowsocksr/ShadowsocksX-NG/develop/ShadowsocksX-NG/backchn.acl",
            "AutoConfigureNetworkServices": NSNumber(value: true as Bool),
            "LocalHTTP.ListenAddress": "127.0.0.1",
            "LocalHTTP.ListenPort": NSNumber(value: 1091 as UInt16),
            "LocalHTTPOn": true,
            "LocalHTTP.FollowGlobal": true,
            "AutoCheckUpdate": true,
            "ACLFileName": "chn.acl",
            "Subscribes": [],
            "AutoUpdateSubscribe":true,
            "ApiDomain":"",
            "AllApiDomains":"",
            "About":"",
        ])
    }
    
    
    
}
