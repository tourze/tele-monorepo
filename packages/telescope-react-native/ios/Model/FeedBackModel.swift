//
//  FeedBackModel.swift

//
//  Created by 蔡庆敏 on 2019/10/21.
//  Copyright © 2019 TouchingApp. All rights reserved.
//

import Foundation

open class FeedBackModel: NSObject {
    
    enum FeedBackKey: String {
        case CREATED_AT = "created_at"
        case REPLAY_AT = "reply_at"
        case CONTENT = "content"
        case REPLYCONTENT = "reply_content"
    }
    
    open var createdAt: String?
    open var replyAt: String?
    open var content: String?
    open var replyContent: String?
    open var msgWidth : CGFloat?
    open var msgHeight : CGFloat?
    
    public init?(dic: Dictionary<String,Any>) {
        createdAt = dic[FeedBackKey.CREATED_AT.rawValue] as? String
        replyAt = dic[FeedBackKey.REPLAY_AT.rawValue] as? String
        content = dic[FeedBackKey.CONTENT.rawValue] as? String
        replyContent = dic[FeedBackKey.REPLYCONTENT.rawValue] as? String
    }

}
