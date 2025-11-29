//
//  AboutViewController.swift

//  Copyright © 2019 TouchingApp. All rights reserved.
//

import Foundation
import UIKit
import SnapKit
import SafariServices

class AboutViewController: UIViewController, SFSafariViewControllerDelegate {
    
    let imageView = UIImageView()
    let titleLabel = UILabel()
    let contentLabel = UILabel()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        configView()
        setviewConstraint()
    }
    
    func configView() {
        title = "关于我们"
        view.backgroundColor = .white
        
        imageView.image = UIImage.init(named: "logo_01")
        
        //应用程序信息
//        let infoDictionary = Bundle.main.infoDictionary!
        //let appDisplayName = infoDictionary["CFBundleDisplayName"] //程序名称
//        let majorVersion = infoDictionary["CFBundleShortVersionString"]//主程序版本号
//        let minorVersion = infoDictionary["CFBundleVersion"]//版本号（内部标示）
//        let appVersion = majorVersion as! String

       // titleLabel.text = appDisplayName as? String
        titleLabel.text =  AppData.webConfig?.about ?? "Telescope为客户提供高速,稳定,安全的网络服务。本产品只用于工作和学习,请勿进行任何非法活动"//appDisplayName as? String
        titleLabel.font = UIFont(name: "PingFangSC-Regular", size: 15)
        titleLabel.textColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.6)
        titleLabel.numberOfLines=0 // 行数设置为0
        // 换行的模式我们选择文本自适应
        titleLabel.lineBreakMode = NSLineBreakMode.byWordWrapping
        titleLabel.textAlignment = .center
        
        contentLabel.font = UIFont(name: "PingFangSC-Regular", size: 15)
        contentLabel.textColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.6)
        contentLabel.textAlignment = .center
        contentLabel.lineBreakMode = NSLineBreakMode.byWordWrapping
        contentLabel.numberOfLines = 0
        contentLabel.text = "版本号：" + SystemUtil.appVersion + "(\(SystemUtil.appBuild))" + "\n\(AppData.webConfig?.email ?? "")"

        view.addSubview(imageView)
        view.addSubview(titleLabel)
        view.addSubview(contentLabel)
        view.addSubview(officialWebBtn)
        view.addSubview(termsBtn)
        view.addSubview(privacyPolicyBtn)
    }
    
    lazy var officialWebBtn: UIButton = {
        
        let blueAttributes: [NSAttributedString.Key: Any] = [
              .font: UIFont.systemFont(ofSize: 15),
              .foregroundColor: UIColor.blue,
              .underlineStyle: NSUnderlineStyle.single.rawValue]
        
        let lightGrayAttributes: [NSAttributedString.Key: Any] = [
              .font: UIFont.systemFont(ofSize: 15),
              .foregroundColor: UIColor.lightGray,
              .underlineStyle: NSUnderlineStyle.single.rawValue]
        
        let b = UIButton(type: .custom)
        b.addTarget(self, action: #selector(self.webBtnPress(_:)), for: .touchUpInside)
//        b.setTitle(AppData.webConfig?.homeUrl, for: UIControl.State())
        
        
        var blueAttributeString = NSMutableAttributedString(string: "https://phone.safetelescope.cc/support.html", attributes: blueAttributes)
        var lightGrayAttributeString = NSMutableAttributedString(string: "https://phone.safetelescope.cc/support.html", attributes: lightGrayAttributes)

        let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
        if iosExamine || LocalTools.instance.AccountCardActive() {
            blueAttributeString = NSMutableAttributedString(string: AppData.webConfig?.homeUrl ?? "", attributes: blueAttributes)
            lightGrayAttributeString = NSMutableAttributedString(string: AppData.webConfig?.homeUrl ?? "", attributes: lightGrayAttributes)
        }

        b.setAttributedTitle(blueAttributeString, for: .normal)
        b.setAttributedTitle(lightGrayAttributeString, for: .highlighted)

        return b
    }()
    
    lazy var termsBtn: UIButton = {
        
        let blueAttributes: [NSAttributedString.Key: Any] = [
              .font: UIFont.systemFont(ofSize: 16),
              .foregroundColor: UIColor.blue]
        
        let lightGrayAttributes: [NSAttributedString.Key: Any] = [
              .font: UIFont.systemFont(ofSize: 16),
              .foregroundColor: UIColor.lightGray]
        
        let b = UIButton(type: .custom)
        b.addTarget(self, action: #selector(self.termsBtnPress(_:)), for: .touchUpInside)
        let blueAttributeString = NSMutableAttributedString(string: "《服务条款》", attributes: blueAttributes)
        let lightGrayAttributeString = NSMutableAttributedString(string: "《服务条款》", attributes: lightGrayAttributes)

        b.setAttributedTitle(blueAttributeString, for: .normal)
        b.setAttributedTitle(lightGrayAttributeString, for: .highlighted)

        return b
    }()
    
    lazy var privacyPolicyBtn: UIButton = {
        
        let blueAttributes: [NSAttributedString.Key: Any] = [
              .font: UIFont.systemFont(ofSize: 16),
              .foregroundColor: UIColor.blue]
        
        let lightGrayAttributes: [NSAttributedString.Key: Any] = [
              .font: UIFont.systemFont(ofSize: 16),
              .foregroundColor: UIColor.lightGray]
        
        let b = UIButton(type: .custom)
        b.addTarget(self, action: #selector(self.privacyPolicyBtnPress(_:)), for: .touchUpInside)
        let blueAttributeString = NSMutableAttributedString(string: "《隐私策略》", attributes: blueAttributes)
        let lightGrayAttributeString = NSMutableAttributedString(string: "《隐私策略》", attributes: lightGrayAttributes)

        b.setAttributedTitle(blueAttributeString, for: .normal)
        b.setAttributedTitle(lightGrayAttributeString, for: .highlighted)

        return b
    }()
    
    @objc func webBtnPress(_: UIButton) {
        let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
        if iosExamine || LocalTools.instance.AccountCardActive() {
            if let homeUrl = AppData.webConfig?.homeUrl {
                let vc = FlySafariVC(url: URL(string: homeUrl)!)
                vc.delegate = self
                self.present(vc, animated: true, completion: nil)
            }
        } else {
            let vc = FlySafariVC(url: URL(string: "https://phone.safetelescope.cc/support.html")!)
            vc.delegate = self
            self.present(vc, animated: true, completion: nil)
        }
        
    }
    
    @objc func termsBtnPress(_: UIButton) {
        let vc = TermsViewController()
        self.navigationController?.pushViewController(vc, animated: true)
    }
    
    @objc func privacyPolicyBtnPress(_: UIButton) {
        
        
        let vc = PrivacyPolicyViewController()
        self.navigationController?.pushViewController(vc, animated: true)
    }
    
    func setviewConstraint() {
        imageView.snp.makeConstraints { (make) in
            make.centerX.equalTo(view)
            make.centerY.equalTo(view).offset(-80)
            make.width.height.equalTo(150)
        }
        
        titleLabel.snp.makeConstraints { (make) in
            make.top.equalTo(imageView.snp.bottom).offset(20)
            make.centerX.equalTo(imageView)
            make.width.equalTo(300)
        }
        
        contentLabel.snp.makeConstraints { (make) in
            make.top.equalTo(titleLabel.snp.bottom).offset(0)
            make.centerX.equalTo(imageView)
        }
        
        officialWebBtn.snp.makeConstraints { (make) in
            make.top.equalTo(contentLabel.snp.bottom)
            make.centerX.equalTo(imageView)
        }
        
        privacyPolicyBtn.snp.makeConstraints { make in
            make.bottom.equalToSuperview().offset(-20)
            make.centerX.equalToSuperview()
        }
        
        termsBtn.snp.makeConstraints { make in
            make.bottom.equalTo(privacyPolicyBtn.snp.top).offset(-10)
            make.centerX.equalToSuperview()
        }
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    
    @objc func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
        controller.dismiss(animated: true) {
        }
    }
}
