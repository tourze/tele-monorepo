//
//  CurrentGroupCell.swift

//
//  Created by LEI on 4/13/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import UIKit
import SnapKit
import ShadowLibrary

class CurrentGroupCell: UITableViewCell {
    
    var switchVPN: (()->Void)?
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        contentView.addSubview(nameLabel)
        contentView.addSubview(switchButton)
        setupLayout()
    }
    
    @objc func onSwitchValueChanged() {
        switchVPN?()
    }
    
    func config(_ name: String?, status: Bool, switchVPN: (() -> Void)?) {
        nameLabel.text = name ?? "None".localized()

        switchButton.addTarget(self, action: #selector(self.onSwitchValueChanged), for: .valueChanged)
        switchButton.isOn = status

        self.switchVPN = switchVPN
    }
    
    func configOnlyName(_ name: String?) {
        nameLabel.text = name ?? "None".localized()
        switchButton.isHidden = true
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func setupLayout() {
        
        switchButton.snp.makeConstraints { (make) in
            make.centerY.equalToSuperview()
            make.right.equalToSuperview().offset(-20)
            make.size.equalTo(CGSize(width: 70, height: 27))
        }
        
        nameLabel.snp.makeConstraints { (make) in
            make.left.equalToSuperview().offset(20)
            make.centerY.equalToSuperview()
            make.right.equalTo(switchButton.snp.left).offset(-15)
        }

    }
    
    lazy var nameLabel: UILabel = {
        let v = UILabel()
        v.font = UIFont.boldSystemFont(ofSize: 17)
        v.textColor = UIColor.darkGray
        return v
    }()
    
    lazy var switchButton: UISwitch = {
        let v = UISwitch()
        v.tintColor = UIColor.lightGray
        return v
    }()

    
}
