//
//  ActiveRecordCell.swift
//  Telescope
//
//  Created by  on 2020/12/27.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation

import SnapKit

class ActiveRecordCell: UITableViewCell {
    
    let messageTitle = UILabel()
    
    let messageText = UILabel()
  
    
    let lineView = UIView()
    
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: .default, reuseIdentifier: reuseIdentifier)
        
        configeView()
        setviewConstraint()
    }
    
    var model: CardActiveRecord? {//数据
        didSet {
            messageTitle.text = "卡号：" + (model?.card_number ?? "")
            
            messageText.text = "激活时间：" + (model?.active_time ?? "")
          
        }
    }
    
    //MARK: UI
    func configeView() {
//        contentView.backgroundColor = UIColor(red: 0.95, green: 0.96, blue: 0.96, alpha: 1)
        
        contentView.addSubview(messageTitle)
        contentView.addSubview(messageText)
       
        contentView.addSubview(lineView)
        
        lineView.backgroundColor = Color.Gray
        messageText.textColor = Color.Gray
      
        
        
        
  
    }
    
    func setviewConstraint() {
        
        messageTitle.snp.makeConstraints{(make) in
            make.left.equalTo(contentView).offset(20)
            make.right.equalTo(contentView).offset(-20)
            make.top.equalTo(contentView).offset(12)
        }
        
        messageText.snp.makeConstraints{ (make) in
            make.top.equalTo(messageTitle.snp.bottom).offset(5)
            make.left.equalTo(messageTitle)
        }
        
      
        lineView.snp.makeConstraints{ (make) in
            make.top.equalTo(contentView.snp.bottom)
            make.left.equalTo(contentView).offset(20)
            make.right.equalTo(contentView).offset(-20)
            make.height.equalTo(0.3)
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
