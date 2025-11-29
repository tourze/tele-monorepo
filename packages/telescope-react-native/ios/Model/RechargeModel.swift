//
//  RechargeModel.swift
//  eliteulive
//
//  Created by Elite Edu on 2019/9/7.
//  Copyright © 2019 Ben. All rights reserved.
//

import UIKit

open class RechargeModel: NSObject {
    
    enum RechargeKey: String {
        case ID = "id"
        case Title = "title"
        case Price = "price"
        case Content = "content"
        case IsHot = "is_hot"
        case IsTop = "is_top"
    }
    
    open var id: Int?
    open var title: String?
    open var price: Int?
    open var content: String?
    open var isHot: Bool?
    open var isTop: Bool?
    
    public init?(dic: Dictionary<String,Any>) {
        id = dic[RechargeKey.ID.rawValue] as? Int
        title = dic[RechargeKey.Title.rawValue] as? String
        price = dic[RechargeKey.Price.rawValue] as? Int
        content = dic[RechargeKey.Content.rawValue] as? String
        isHot = dic[RechargeKey.IsHot.rawValue] as? Bool
        isTop = dic[RechargeKey.IsTop.rawValue] as? Bool
    }

}
