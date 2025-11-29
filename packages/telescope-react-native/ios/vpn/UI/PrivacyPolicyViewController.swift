//
//  PrivacyPolicyViewController.swift
//  Telescope
//
//  Created by Shadow on 2022/3/4.
//  Copyright © 2022 TouchingApp. All rights reserved.
//

import Foundation

import UIKit
import SnapKit

class PrivacyPolicyViewController: UIViewController {
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        configView()
        setviewConstraint()
    }
    
    lazy var termsTextView: UITextView = {
        let v = UITextView()
        v.isEditable = false
        v.backgroundColor = Color.Background
        
        v.text = """
        本隐私政策适用于我们提供和运营的所有服务。
        尊敬的用户：
        我们是中硕网络服务有限公司, 很高兴您能阅读这封非正式的信件。感谢您的支持和信任。
        我们的目标是保护您的隐私，我们承诺，我们永远不会记录以下信息：
        您的浏览记录：
        我们不会查看或记录您访问的网站。
        您的流量数据：
        对于您访问的目标, 我们不会记录您的在线痕迹或条件。
        您的DNS查询：
        我们不会获取您的个人信息。
        同时，以下内容将用于为您提供更好的服务和售后保证：
        连接到VPN服务时的日期（不是时间）。
        您的数据条件。
        您所购买的数据包信息。
        连接错误信息。
        所有这些信息不包含任何个人身份信息。相反，它可以帮助我们为您提供最好的支持.
        """
        
        return v
    }()
    
    func configView() {
        title = "隐私策略"
        view.backgroundColor = .white
        
        view.addSubview(termsTextView)
    }
    
    func setviewConstraint() {
        termsTextView.snp.makeConstraints { make in
            make.edges.equalToSuperview()
        }
    }
}
 
