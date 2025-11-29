//
//  MainConnectView.swift

//
//  Created by  on 2020/10/28.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation



import SnapKit

class MainConnectView: UIView {
    
    //msg
    
    let handImageView = UIImageView()
    
    let statusLabel = UILabel() //连接状态
    
    let mainBackgroupView = UIImageView()
    
    let bottomView = UIView()
    
    let line1View = UIView()
    
    let line2View = UIView()
    
    let titleLabel = UILabel() //请点击中心按钮
    
    let adlabel = UILabel() //广告
    
    let chooseServerView = ChooseServerView()

    var mMsgModel:AdModel?
    var mAdModel:AdModel?
    
    lazy var connectingImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "connecting")
        v.isHidden = true
        return v
    }()
    
    lazy var pingLabel: UILabel = {
        let v = UILabel()
        v.font = UIFont.systemFont(ofSize: 12)
        v.text = "12ms"
        v.textColor = Color.DefualtColor
        v.textAlignment = .center

        return v
    }()
    
    override init(frame:CGRect){
        super.init(frame: CGRect.zero)
        configeView()
        setViewConstraint()
        
    }
    
 
    
    //MARK: UI
    func configeView() {
       
        
//        self.backgroundColor = Color.DefualtColor
        self.addSubview(mainBackgroupView)
        self.addSubview(handImageView)
        self.addSubview(connectingImageView)
        self.addSubview(statusLabel)
        self.addSubview(pingLabel)
        
//        chooseView.addSubview(chooseServerView)

        self.addSubview(bottomView)
        
        self.addSubview(titleLabel)
        self.addSubview(chooseServerView)
        self.addSubview(adlabel)
        
        self.addSubview(line1View)
        self.addSubview(line2View)
        
        line1View.backgroundColor = Color.Gray
        line2View.backgroundColor = Color.Gray
        
        
        bottomView.backgroundColor = .white
        bottomView.layer.cornerRadius = 24
        bottomView.layer.masksToBounds = true
   
        statusLabel.textAlignment = .center
        statusLabel.text = "点击连接"
        statusLabel.textColor = Color.DefualtColor
        
        handImageView.image = UIImage(named: "connect_off")
        
        mainBackgroupView.image = UIImage(named: "main_middle")
//        mainBackgroupView.contentMode = .scaleToFill
        
        titleLabel.text = "请点击中心按钮"
        titleLabel.textColor = .black

        titleLabel.font = titleLabel.font.withSize(20)
    
        adlabel.text = ""
        adlabel.textColor = Color.DefualtColor
        adlabel.isHidden = true
        
        
    }
    
    func setViewConstraint() {

        mainBackgroupView.snp.makeConstraints{ (make) in
            make.left.right.equalTo(self)
            make.top.equalTo(self).offset(-100)
            make.bottom.equalTo(bottomView.snp.top).offset(185)
            make.right.equalTo(self)
           
        }
        
        handImageView.snp.makeConstraints{ (make) in
            make.centerY.equalTo(self).offset(-100)
            make.centerX.equalTo(self)
            make.size.equalTo(CGSize(width: 162, height: 162))
        }
        
        connectingImageView.snp.makeConstraints { (make) in
            make.edges.equalTo(handImageView)
        }
        
        statusLabel.snp.makeConstraints{(make) in
            make.top.equalTo(handImageView).offset(180)
            make.centerX.equalTo(self)
            make.size.equalTo(CGSize(width: 277, height: 22))
        }
        
        pingLabel.snp.makeConstraints { make in
            make.top.equalTo(statusLabel.snp.bottom).offset(10)
            make.centerX.equalToSuperview()
            make.size.equalTo(CGSize(width: 277, height: 22))
        }
        
        bottomView.snp.makeConstraints{ (make) in
            make.top.equalTo(statusLabel).offset(82)
            make.left.right.equalTo(self)
            make.bottom.equalTo(self.snp.bottom).offset(25)
        }
        
        titleLabel.snp.makeConstraints{ (make) in
            make.top.equalTo(bottomView).offset(20)
            make.left.equalTo(self).offset(20)
        }
     
        chooseServerView.snp.makeConstraints{ (make) in
            make.top.equalTo(titleLabel).offset(40)
            make.left.equalTo(self)
            make.size.equalTo(CGSize(width: 400, height: 60))
        }
        line1View.snp.makeConstraints{ (make) in
            make.top.equalTo(chooseServerView)
            make.left.equalTo(self).offset(20)
            make.right.equalTo(self).offset(-20)
            make.height.equalTo(0.3)
        }
        
        line2View.snp.makeConstraints{ (make) in
            make.bottom.equalTo(chooseServerView)
            make.left.equalTo(self).offset(20)
            make.right.equalTo(self).offset(-20)
            make.height.equalTo(0.3)
        }
        adlabel.snp.makeConstraints{ (make) in
            make.top.equalTo(chooseServerView).offset(80)
            make.left.equalTo(self).offset(20)
//            make.bottom.equalTo(self).offset(-20)
        }

    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
}


