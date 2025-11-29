//
//  BaseVC.swift

//
//  Created by LEI on 2019/8/2.
//  Copyright © 2019 TouchingApp. All rights reserved.
//

import Foundation

class BaseVC: UIViewController {
    
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
//        navigationController?.navigationBar.tintColor = UIColor.white
    }
    
    func backBarItem() -> UIBarButtonItem{
        return UIBarButtonItem(title: "返回", style: UIBarButtonItem.Style.plain, target: nil, action: nil)
    }

}
