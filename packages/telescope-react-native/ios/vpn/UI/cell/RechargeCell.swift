//
//  RechargeCell.swift
//  Telescope
//
//  Created by LEI on 2021/6/11.
//  Copyright © 2021 TouchingApp. All rights reserved.
//


import SnapKit


class RechargeCell: UITableViewCell {
    
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
    
    
    func config(product: Product, selectId: Int) {
        nameLabel.text = product.title
        detailLabel.text = product.content
        priceLabel.text = product.priceStr
        showPriceLabel.text = product.showPriceStr
        
        limitTimeImageView.isHidden = !product.isHot!
        
        if selectId == product.id {
            backgroundWrapper.image = UIImage(named: "member_block_check")
        } else {
            backgroundWrapper.image = UIImage(named: "member_block")
        }
        
    }
    
    func loadView() {
        selectionStyle = .none
        backgroundColor = "F3F4F6".color

//        backgroundColor = UIColor.init(red: 0.0, green: 0.0, blue: 0.0, alpha: 0.0)
        contentView.addSubview(backgroundWrapper)
        contentView.addSubview(nameLabel)
        contentView.addSubview(vipImageView)
        contentView.addSubview(handselImageView)
        contentView.addSubview(detailLabel)
        contentView.addSubview(priceLabel)
        contentView.addSubview(showPriceLabel)
        contentView.addSubview(limitTimeImageView)

        setupLayout()
    }
    
    func setupLayout() {
        backgroundWrapper.snp.makeConstraints{(make) in
            make.left.equalTo(contentView).offset(16)
            make.right.equalTo(contentView).offset(-16)
            make.top.equalTo(contentView).offset(8)
            make.bottom.equalTo(contentView).offset(-8)
        }
        
        nameLabel.snp.makeConstraints { (make) in
            make.top.equalTo(backgroundWrapper).offset(16)
            make.left.equalTo(backgroundWrapper).offset(16)
        }
        
        vipImageView.snp.makeConstraints { (make) in
            make.left.equalTo(nameLabel.snp.right).offset(6)
            make.centerY.equalTo(nameLabel)
            make.size.equalTo(CGSize(width: 42, height: 16))
        }
        
        handselImageView.snp.makeConstraints { (make) in
            make.top.equalTo(nameLabel.snp.bottom).offset(12)
            make.left.equalTo(nameLabel)
            make.size.equalTo(16)
        }
        
        detailLabel.snp.makeConstraints { (make) in
            make.top.equalTo(handselImageView)
            make.left.equalTo(handselImageView.snp.right).offset(6)
            make.right.equalTo(backgroundWrapper).offset(-90)
        }
        
        priceLabel.snp.makeConstraints { (make) in
            make.right.equalTo(backgroundWrapper).offset(-16)
            make.centerY.equalTo(backgroundWrapper)
        }
        
        showPriceLabel.snp.makeConstraints { (make) in
            make.top.equalTo(priceLabel.snp.bottom).offset(2)
            make.right.equalTo(priceLabel)
        }
        
        limitTimeImageView.snp.makeConstraints { (make) in
            make.top.equalTo(backgroundWrapper.snp.top).offset(3)
            make.right.equalTo(backgroundWrapper.snp.right).offset(-3)
        }
    }
    
    lazy var nameLabel: UILabel = {
        let v = UILabel()
        v.textColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.85)
        v.font = UIFont.boldSystemFont(ofSize: 18)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        v.text = "30天"
        return v
    }()
    
    lazy var vipImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "icon_label_vip")
        return v
    }()
    
    lazy var handselImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "icon_label_zeng")
        return v
    }()

    lazy var detailLabel: UILabel = {
        let v = UILabel()
        v.textColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.45)
        v.font = UIFont.systemFont(ofSize: 12)
        v.numberOfLines = 0
        v.lineBreakMode = NSLineBreakMode.byWordWrapping
        v.textAlignment = .left
        v.text = "120+15天VIP 500G高速流量包 500G高速流量包"
        
        return v
    }()
    
    lazy var priceLabel: UILabel = {
        let v = UILabel()
        v.textColor = "262626".color
        v.font = UIFont.boldSystemFont(ofSize: 18)
        v.text = "￥10.0"
//        v.adjustsFontSizeToFitWidth = true
//        v.minimumScaleFactor = 0.8
        return v
    }()
    
    lazy var showPriceLabel: UILabel = {
        let v = UILabel()
        v.textColor = "8c8c8c".color
        v.font = UIFont.systemFont(ofSize: 16)
        
        let priceString = NSMutableAttributedString.init(string: "￥6.0")
        priceString.addAttribute(NSAttributedString.Key.strikethroughStyle, value: NSNumber.init(value: 1), range: NSRange(location: 0, length: priceString.length))
        v.attributedText = priceString
        
       return v
    }()
    
    
    lazy var limitTimeImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "icon_label_time")
        return v
    }()
    
    lazy var leftColorHintView: UIView = {
        let v = UIView()
        v.backgroundColor = "3498DB".color
        return v
    }()
    
    lazy var backgroundWrapper: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "member_block")
        return v
    }()
    
}

