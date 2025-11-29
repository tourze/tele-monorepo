//
//  EmptyView.swift
//  StarFast
//
//  Created by LEI on 4/22/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import Foundation
import SnapKit

class BaseEmptyView: UIView {
    
    var title: String? {
        didSet(o) {
            titleLabel.text = title
        }
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        addSubview(sadView)
        addSubview(titleLabel)
        titleLabel.text = title
        
        sadView.snp.makeConstraints { (make) in
            make.centerX.equalToSuperview()
            make.size.equalTo(CGSize(width: 80, height: 102))
            make.centerY.equalToSuperview().offset(-120)
        }
        
        titleLabel.snp.makeConstraints { (make) in
            make.centerX.equalTo(sadView)
            make.top.equalTo(sadView.snp.bottom).offset(32)
            make.left.equalToSuperview().offset(40)
            make.right.equalToSuperview().offset(-40)
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    lazy var sadView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "User")
        v.contentMode = .scaleAspectFit
        return v
    }()
    
    lazy var titleLabel: UILabel = {
        let v = UILabel()
        v.textColor = "808080".color
        v.font = UIFont.systemFont(ofSize: 15)
        v.textAlignment = .center
        v.numberOfLines = 0
        return v
    }()
    
}
