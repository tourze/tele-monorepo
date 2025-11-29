//
//  QuickCrispViewController.swift

//
//  Created by  on 2020/10/31.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation
import SnapKit


class ShadowCrispViewController: UIViewController
{
  
    override func viewDidLoad() {
        super.viewDidLoad()
        configView()
        setviewConstraint()
        
        mWebView.navigationDelegate = self
        
        loadCrispHtml()
    }
    
    func configView() {
        title = "在线客服"
        view.backgroundColor = .white
  
        view.addSubview(mWebView)


    }
    
    func setviewConstraint() {
        mWebView.snp.makeConstraints { (make) in
            make.top.bottom.left.right.equalTo(view)
        }
   
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    
    
    
    let mWebView = WKWebView()
    
    var isLoadedWeb = false
    
    fileprivate func loadCrispHtml() {
        
        
        if let url = Bundle.main.url(forResource: "index", withExtension: "html"){
            let request = URLRequest(url: url)
            mWebView.load(request)
        }
        
      
    }
    
    func loadCrispNative(){
        
        CallJavaScript("window.CRISP_TOKEN_ID =\"" + SystemUtil.imei + "\";")
        CallJavaScript("window.CRISP_WEBSITE_ID = \"" + SystemUtil.WEBSITE_ID + "\";")
        CallJavaScript("initialize()",completionHandler: {
            (item, error) in
            if let res = item as? String{
                print(res)
            }
            self.isLoadedWeb =  true
            
            self.loadParamSetting()
            
        })
        
    }
    
    func loadParamSetting(){
        if (AppData.loggedUser != nil)
       {
            SetNickName(String((AppData.loggedUser?.id)!) + "_" + SystemUtil.platform);
            SetSessionData("userId", String(AppData.loggedUser!.id!));
       }
       else
       {
           SetNickName(SystemUtil.imei + "_" + SystemUtil.platform);
       }
      
        SetSessionData("ios-imei", SystemUtil.imei);
        SetSessionData("system-version", "ios \(SystemUtil.systemVersion)");
        SetSessionData("app-version", "\(SystemUtil.appVersion) (\(SystemUtil.appBuild))");
        SetSessionData("isActivity", "\(LocalTools.instance.AccountCardActive())");

    }
    
    
    func SetNickName(_ nickName:String)
    {
        if (isLoadedWeb)
        {
            CallJavaScript("window.$crisp.push([\"set\", \"user:nickname\", [\"" + nickName + "\"]])");
        }
    }

    func SetSessionData(_ key:String,_ value:String)
    {
        if (isLoadedWeb)
        {
            CallJavaScript("window.$crisp.push([\"set\", \"session:data\", [\"" + key + "\", \"" + value + "\"]])");
        }
    }

    
    func CallJavaScript(_ script:String,completionHandler:((Any?, Error?) -> Void)? = nil)  {
        mWebView.evaluateJavaScript(script, completionHandler: completionHandler)
    }
}


extension ShadowCrispViewController:WKNavigationDelegate{
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!){
        let url = webView.url!.absoluteURL
        print("didfinish load \(url)")
        loadCrispNative()
    }
}
