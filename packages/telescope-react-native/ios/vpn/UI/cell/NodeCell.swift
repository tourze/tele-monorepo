//
//  NodeCell.swift
//  Telescope
//
//  Created by Shadow on 2022/5/14.
//  Copyright © 2022 TouchingApp. All rights reserved.
//

import SnapKit
import Kingfisher

class NodeCell: UITableViewCell {
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        loadView()
        preservesSuperviewLayoutMargins = false
        layoutMargins = UIEdgeInsets.zero
        separatorInset = UIEdgeInsets.zero
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    
    func config(node: ProfileServer, selectId: Int64) {
        
        setIconImage(node: node)
        nameLabel.text = node.name
        
        if let detailLabel = node.label {
            if !detailLabel.isEmpty {
                nameLabel.text = nameLabel.text! + "-(" + detailLabel + ")"
            }
        }
        
        if selectId == node.id! {
            selectedImageView.isHidden = false
        }else{
            selectedImageView.isHidden = true
        }

        if node.flag == "auto" {
            pingLabel.text = ""
        } else {
            if let delay = Manager.sharedManager.pingCheckDic[(node.ip)! + String((node.port)!)] as? Int {
                if 0 < delay && delay < 500 {
                    pingLabel.text = "\(delay) ms"
                    pingLabel.textColor = Color.DefualtColor
                } else if delay > 500 {
                    pingLabel.text = "繁忙"
                    pingLabel.textColor = .red
                } else if delay < 0 {
                    pingLabel.text = "超时"
                    pingLabel.textColor = .red
                }
            }
            
        }
        
    }
    
    func downloadFlags() {

        if AppData.nodeFlagsDownloading == false {
            AppData.nodeFlagsDownloading = true
            ShadowApiService.instance.GetFlags(onSuccess: { result in
                if(result.code == HttpResult.HTTP_OK && result.data != nil) {
                    if let flagsArray = result.data {
                        var count = 0
                        for flag in flagsArray {
                            ImageDownloader.default.downloadImage(with: URL(string: flag.svgUrl!)!) { result in
                                switch result {
                                case .success(let value):
                                    let cache = ImageCache.default
                                    if !cache.isCached(forKey: flag.flags ?? "1") {
                                        cache.store(value.image, forKey: flag.flags ?? "1")
                                    }
                                    count += 1
                                    if count >= flagsArray.count {
                                        AppData.nodeFlagsDownloading = false
                                        NotificationCenter.default.post(name: NSNotification.Name(rawValue: "nodeListReload"), object: nil)

                                        
                                    }
                                case .failure(let error):
                                    count += 1
                                    if count >= flagsArray.count {
                                        AppData.nodeFlagsDownloading = false
                                        NotificationCenter.default.post(name: NSNotification.Name(rawValue: "nodeListReload"), object: nil)

                                    }
                                    debugPrint(error)
                                }
                            }
                            
                        }
                    }
                }
            }, onFail: { result in
                AppData.nodeFlagsDownloading = false
            }, token: AppData.authUser?.token)
        }
        
    }
    
    func setIconImage(node: ProfileServer) {
        
        if node.flag == nil {
            flagImageView.image =  "Direct".originalImage
            return
        }
        
        let name = node.flag ?? ""
        
        if(node.flag?.originalImage == nil) {
            let cache = ImageCache.default
            
            cache.retrieveImage(forKey: name) { result  in
                switch result {
                
                case .success(let value):
                    
                    switch value {
                        
                    case .disk(let image):
                        self.flagImageView.image = image

                    case .memory(let image):
                        self.flagImageView.image = image

                    case .none:
                        self.flagImageView.image =  "Direct".originalImage
                        self.downloadFlags()
                    }

                case .failure(let error):
                    self.flagImageView.image =  "Direct".originalImage
                    self.downloadFlags()
                    print(error)
                }
            }
        } else {
            flagImageView.image = name.originalImage
        }
    }
    
    
    func loadView() {
        selectionStyle = .none
        backgroundColor = "F3F4F6".color

        contentView.addSubview(flagImageView)
        contentView.addSubview(nameLabel)
        contentView.addSubview(pingLabel)
        contentView.addSubview(selectedImageView)
        contentView.addSubview(lineView)

        setupLayout()
    }
    
    func setupLayout() {
        flagImageView.snp.makeConstraints{(make) in
            make.left.equalTo(contentView).offset(10)
            make.centerY.equalToSuperview()
            make.size.equalTo(CGSize(width: 36, height: 24))
        }
        
        nameLabel.snp.makeConstraints { (make) in
            make.left.equalTo(flagImageView.snp.right).offset(10)
            make.centerY.equalToSuperview()
        }
        
        selectedImageView.snp.makeConstraints { (make) in
            make.right.equalToSuperview().offset(-10)
            make.centerY.equalToSuperview()
            make.size.equalTo(CGSize(width: 20, height: 20))
        }
        
        pingLabel.snp.makeConstraints { (make) in
            make.right.equalTo(selectedImageView.snp.left).offset(-6)
            make.centerY.equalToSuperview()
        }
        
        lineView.snp.makeConstraints{ (make) in
            make.left.equalTo(contentView).offset(10)
            make.right.equalTo(contentView).offset(-10)
            make.height.equalTo(0.3)
            make.bottom.equalToSuperview()
        }
    }
    
    lazy var flagImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "auto")
        return v
    }()
    
    lazy var nameLabel: UILabel = {
        let v = UILabel()
        v.textColor = .black
        v.font = UIFont.systemFont(ofSize: 16)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        return v
    }()
    

    lazy var pingLabel: UILabel = {
        let v = UILabel()
        v.font = UIFont.systemFont(ofSize: 12)
        v.numberOfLines = 0
        v.text = "12ms"
        v.textColor = Color.DefualtColor
        
        return v
    }()
    
    lazy var selectedImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "icon_btn_radio_sel")
        return v
    }()
 
    lazy var lineView: UIView = {
        let v = UIView()
        v.backgroundColor = "DDDDDD".color
        return v
    }()
}

