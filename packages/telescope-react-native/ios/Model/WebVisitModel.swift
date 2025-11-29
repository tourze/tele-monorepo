//
//  WebVisitModel.swift
//  eliteulive
//
//  Created by Elite Edu on 2019/9/8.
//  Copyright © 2019 Ben. All rights reserved.
//

import UIKit

open class WebVisitModel: NSObject {
    enum WebVisitKey: String {
        case IconUrl = "icon_url" //图片
        case Title = "title" //标题
        case WebUrl = "web_url" //点击跳转的url
    }
    
    open var iconUrl: String?
    open var title: String?
    open var webUrl: String?
    
    public init?(dic: Dictionary<String,Any>) {
        iconUrl = dic[WebVisitKey.IconUrl.rawValue] as? String
        title = dic[WebVisitKey.Title.rawValue] as? String
        webUrl = dic[WebVisitKey.WebUrl.rawValue] as? String
    }
}
