//
//  CommonProblemModel.swift
//  eliteulive
//
//  Created by Elite Edu on 2019/9/8.
//  Copyright © 2019 Ben. All rights reserved.
//

import UIKit

open class CommonProblemModel: NSObject {
    enum CommonProblemKey: String {
        case IconUrl = "icon_url" //图片
        case Title = "title" //标题
        case Detail = "detail" //详情
    }
    
    open var iconUrl: String?
    open var title: String?
    open var detail: String?
    
    public init?(dic: Dictionary<String,Any>) {
        iconUrl = dic[CommonProblemKey.IconUrl.rawValue] as? String
        title = dic[CommonProblemKey.Title.rawValue] as? String
        detail = dic[CommonProblemKey.Detail.rawValue] as? String
    }
}
