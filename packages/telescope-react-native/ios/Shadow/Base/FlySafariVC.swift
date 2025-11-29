//
//  BaseSafariViewController.swift

//
//  Created by LEI on 12/30/15.
//  Copyright © 2015 TouchingApp. All rights reserved.
//

import Foundation
import SafariServices

class FlySafariVC: SFSafariViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
//        navigationItem.leftBarButtonItem = UIBarButtonItem(title: "", style: .plain, target: nil, action:nil)
//
        self.navigationController?.toolbar.barTintColor = .black
        self.navigationController?.toolbar.tintColor = .black
        self.navigationController?.toolbar.barStyle = .black
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
}
