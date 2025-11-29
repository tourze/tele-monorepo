//
//  RecordModel.swift
//  eliteulive
//
//  Created by Elite Edu on 2019/9/8.
//  Copyright © 2019 Ben. All rights reserved.
//

import UIKit

open class RecordModel: NSObject {
    enum RecordKey: String {
        case ID = "id" //订单id
        case Total = "total" //订单总金额
        case CreatedAt = "created_at"
        case OrderItem = "order_item" //商品详情
        case GoodsName = "goods_name" //商品名称
        case GoodsId = "goods_id" //商品id
    }
    
    open var id: Int?
    open var total: String?
    open var createdAt: String?
    open var goodsName: String?
    open var goodsID: String?
    
    public init?(dic: Dictionary<String,Any>) {
        id = dic[RecordKey.ID.rawValue] as? Int
        total = dic[RecordKey.Total.rawValue] as? String
        createdAt = dic[RecordKey.CreatedAt.rawValue] as? String
        
        if let goodDic = dic[RecordKey.OrderItem.rawValue] as? Dictionary<String, Any>  {
            goodsName = goodDic[RecordKey.GoodsName.rawValue] as? String
            goodsID = goodDic[RecordKey.GoodsId.rawValue] as? String
        }
        
    }
}
