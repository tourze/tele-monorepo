//
//  RechargeRecordCell.swift
//  Telescope
//
//  Created by shadow on 2022/5/18.
//  Copyright © 2022 TouchingApp. All rights reserved.
//

import SnapKit
import UIKit

class RechargeRecordCell: UITableViewCell {
    
    let goodsNameLabel = UILabel()
    
    let orderNoLabel = UILabel()
  
    let payTimeLabel = UILabel()

    
    let lineView = UIView()
    
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: .default, reuseIdentifier: reuseIdentifier)
        
        configeView()
        setviewConstraint()
    }
    
    var model: Order? {//数据
        didSet {
            
            goodsNameLabel.text = model?.orderItem?.goodsName ?? ""
            
            orderNoLabel.text = model?.orderNo ?? ""
            
            payTimeLabel.text = (model?.payTime ?? "").replacingOccurrences(of: " ", with: "\n")
        }
    }
    
    //MARK: UI
    func configeView() {
//        contentView.backgroundColor = UIColor(red: 0.95, green: 0.96, blue: 0.96, alpha: 1)
        
        contentView.addSubview(goodsNameLabel)
        contentView.addSubview(orderNoLabel)
        contentView.addSubview(payTimeLabel)
       
        contentView.addSubview(lineView)
        
        lineView.backgroundColor = .gray
        orderNoLabel.textColor = .lightGray
        orderNoLabel.font = UIFont.systemFont(ofSize: 14)
        payTimeLabel.textColor = Color.DefualtColor
        payTimeLabel.numberOfLines = 0
        payTimeLabel.textAlignment = .right
        payTimeLabel.font = UIFont.systemFont(ofSize: 12)

  
    }
    
    func setviewConstraint() {
        
        goodsNameLabel.snp.makeConstraints{(make) in
            make.left.equalTo(contentView).offset(20)
            make.right.equalTo(contentView).offset(-20)
            make.top.equalTo(contentView).offset(12)
        }
        
        orderNoLabel.snp.makeConstraints{ (make) in
            make.top.equalTo(goodsNameLabel.snp.bottom).offset(5)
            make.left.equalTo(goodsNameLabel)
        }
        
        payTimeLabel.snp.makeConstraints { make in
            make.right.equalToSuperview().offset(-16)
            make.centerY.equalToSuperview()
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
