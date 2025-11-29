//
//  AppData.swift

//
//  Created by sysdlo on 2019/9/21.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation

class AppData: NSObject {
    
    static var authUser: AuthUser?
    
    static var loggedUser: QUser?
    
    static var products:[Product] = []
    
    static var webConfig:WebConfigModel?
    
    static var appNeedAccountLogin:Bool = false

    static var nodeFlagsDownloading:Bool = false

    
    static func isTrailUser(user:QUser) -> Bool {
        return user.isTrial ?? false
    }
    
    static func isExpired(user:QUser?) ->Bool{
        return user?.status == UserStatus.EXPIRED
    }
    

    static var userLoginData = UserLoginData()

    
}
