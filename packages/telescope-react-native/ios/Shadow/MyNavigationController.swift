//
//  MyNavigationController.swift

//
//  Created by LEI on 2019/8/26.
//  Copyright © 2019 TouchingApp. All rights reserved.
//

import Foundation

class MyNavigationController: UINavigationController {
    
    override var childForStatusBarStyle: UIViewController? {
        return topViewController
    }
    
}
