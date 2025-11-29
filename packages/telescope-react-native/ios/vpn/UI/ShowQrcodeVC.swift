//
//  ShowQrcodeVC.swift
//  Telescope
//
//  Created by LEI on 2018/1/18.
//  Copyright © 2018年 TouchingApp. All rights reserved.
//
import SnapKit

class ShowQrcodeVC: UIViewController {
    var nodeInfo: ProfileServer


    override convenience init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        self.init()
    }
    
    init(upstreamNode: ProfileServer? = nil) {
        if let proxy = upstreamNode {
            self.nodeInfo = proxy
        }else {
            self.nodeInfo = ProfileServer()
        }
        
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - View Life Cycle
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.title = "Share By Qrcode".localized()
        navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .action, target: self, action: #selector(share))

        initUI()
//        generateForm()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    func initUI() {
        view.backgroundColor = UIColor.white
        view.addSubview(qrcodeView)
        view.addSubview(titleLabel)
        
        qrcodeView.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.size.equalTo(CGSize(width: 200, height: 200))
            make.centerY.equalToSuperview()
        }
        
        titleLabel.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(qrcodeView.snp.top).offset(-48)
            make.left.equalToSuperview().offset(40)
            make.right.equalToSuperview().offset(-40)
        }
        
    }
    
    lazy var qrcodeView: UIImageView = {
        let v = UIImageView()
        var shareUrl: String? = nil
        shareUrl = self.nodeInfo.shareUrl

        HMScanner.qrImage(with: shareUrl, avatar: nil, completion: { (image) in
            v.image = image
        })
        v.contentMode = .scaleAspectFit
        return v
    }()
    
    lazy var titleLabel: UILabel = {
        let v = UILabel()
        v.textColor = "808080".color
        v.font = UIFont.systemFont(ofSize: 18)
        v.textAlignment = .center
        v.numberOfLines = 0
        return v
    }()
    
    @objc func share() {
        var shareItems: [AnyObject] = []
        shareItems.append("Telescope [https://itunes.apple.com/us/app/id1572301158]" as AnyObject)
        shareItems.append(qrcodeView.image!)
        let shareVC = UIActivityViewController(activityItems: shareItems, applicationActivities: nil)
        
        if UIDevice.current.userInterfaceIdiom == UIUserInterfaceIdiom.phone {
            self.present(shareVC, animated: true, completion: nil)
        }else {
            let popover = shareVC.popoverPresentationController
            if (popover != nil){
                popover?.sourceView = self.view
                //                popover?.sourceRect = sourceView.frame
                popover?.permittedArrowDirections = UIPopoverArrowDirection.any
                
                self.present(shareVC, animated: true, completion: nil)
            }
        }
    }
}
