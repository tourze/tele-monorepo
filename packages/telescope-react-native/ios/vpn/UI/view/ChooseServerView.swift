//
//  ChooseServerView.swift

//
//  Created by  on 2020/10/28.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation
import Kingfisher

import SnapKit

class ChooseServerView: UIView {
    
    

    let titleLabel = UILabel() //标题
 

    let flagImageView = UIImageView() // 国旗
    let nodeLabel = UILabel()
    var model:ProfileServer? = nil
    
    override init(frame:CGRect){
        super.init(frame: CGRect.zero)
        configeView()
        setViewConstraint()
        var model = LocalTools.instance.getActiviteProfile()
        if model != nil{
            updateModel(model: model!)
        }else{
            model = LocalTools.instance.autoSelectProfieServer()
             
            if model != nil{
                updateModel(model: model!)
            }
        }
    }
    
    func updateModel(model:ProfileServer){
        self.model = model
        self.setIconImage()
        nodeLabel.text = model.name
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
    
    func setIconImage() {
        
        if model?.flag == nil {
            self.flagImageView.image =  "Direct".originalImage
            return
        }
        let name = model?.flag ?? ""

        if(model?.flag?.originalImage == nil) {
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
    
    //MARK: UI
    func configeView() {
//        self.backgroundColor = Color.DefualtColor
      
        self.addSubview(titleLabel)
        self.addSubview(flagImageView)
        self.addSubview(nodeLabel)
        
    
        titleLabel.text = "节点列表-->"
        titleLabel.textColor = Color.Gray
        flagImageView.image = "Direct".originalImage
        nodeLabel.text = "点击选择节点"
        nodeLabel.textColor = Color.Gray
        
    }
    
    func setViewConstraint() {
      
        
        titleLabel.snp.makeConstraints{ (make) in
            make.centerY.equalTo(self)
            make.left.equalTo(self).offset(20)
            make.size.equalTo(CGSize(width: 128, height: 24))
        }

        flagImageView.snp.makeConstraints{ (make) in
            make.centerY.equalTo(self)
            make.left.equalTo(titleLabel).offset(134)
            make.size.equalTo(CGSize(width: 32, height: 24))
        }
        
        nodeLabel.snp.makeConstraints{ (make) in
            make.centerY.equalTo(self)
            make.left.equalTo(flagImageView.snp.right).offset(10)
            make.size.equalTo(CGSize(width: 126, height: 24))
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
