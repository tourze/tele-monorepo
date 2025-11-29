//
//  MessegeCell.swift
//  
//
//  Created by  on 2020/10/31.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation

import SnapKit

class MessageCell: UITableViewCell {
    
    let messageTitle = UILabel()
    
    let messageText = UILabel()
    
    let newFlagImage = UIImageView()
    
    let lineView = UIView()
    
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: .default, reuseIdentifier: reuseIdentifier)
        
        configeView()
        setviewConstraint()
    }
    
    var model: AdModel? {//数据
        didSet {

            newFlagImage.isHidden = (model?.read == true)
            
            messageTitle.text = model?.title ?? ""
            
            messageText.text = model?.msgTime ?? ""
        }
    }
    
    //MARK: UI
    func configeView() {
//        contentView.backgroundColor = UIColor(red: 0.95, green: 0.96, blue: 0.96, alpha: 1)
        
        messageTitle.numberOfLines = 0
        messageTitle.lineBreakMode = NSLineBreakMode.byWordWrapping
        contentView.addSubview(messageTitle)
        contentView.addSubview(messageText)
        contentView.addSubview(newFlagImage)
        contentView.addSubview(lineView)
        
        lineView.backgroundColor = Color.Gray
        messageText.textColor = Color.Gray
        newFlagImage.image = UIImage(named: "icon_label_new")
  
    }
    
    func setviewConstraint() {
        
        messageTitle.snp.makeConstraints{(make) in
            make.left.equalTo(contentView).offset(20)
            make.right.equalTo(contentView).offset(-20)
            make.top.equalTo(contentView).offset(12)
        }
        
        messageText.snp.makeConstraints{ (make) in
            make.top.equalTo(messageTitle.snp.bottom).offset(8)
            make.left.equalTo(messageTitle)
            
        }
        
        newFlagImage.snp.makeConstraints{ (make) in
            make.top.equalTo(messageText.snp.top)
            make.left.equalTo(messageText.snp.right)
            
            make.size.equalTo(CGSize(width: 35, height: 14))
        }
        
        lineView.snp.makeConstraints{ (make) in
            make.top.equalTo(messageText.snp.bottom).offset(10)
            make.left.equalTo(contentView).offset(20)
            make.right.equalTo(contentView).offset(-20)
            make.height.equalTo(0.3)
            make.bottom.equalToSuperview()
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
