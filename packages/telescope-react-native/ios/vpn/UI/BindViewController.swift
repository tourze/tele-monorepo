//
//  BindViewController.swift
//  Telescope
//
//  Created by LEI on 2021/6/22.
//  Copyright © 2021 TouchingApp. All rights reserved.
//

import Foundation


class BindViewController: UIViewController {
    
    var isPhoneRegister = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "登录"
        
        view.backgroundColor = .white
        
    
        view.addSubview(logoImageView)
        view.addSubview(emailTextFeild)
        view.addSubview(lineView1)
        view.addSubview(passwdTextFeild)
        view.addSubview(lineView2)
        view.addSubview(comfirmBtn)
        view.addSubview(resetPasswdBtn)
        
        
        setRightNavgation()
        setupLayout()
        
        if(AppData.webConfig?.regiestWay == "phone"){
            isPhoneRegister = true
        }else{
            isPhoneRegister = false
        }
        
        view.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleTap)))
    }
    
    // MARK: lazy UI
    lazy var logoImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "logo_01")
        v.contentMode = .scaleAspectFit
        return v
    }()
    
    lazy var emailTextFeild: UITextField = {
        let textFeild = UITextField()
        textFeild.placeholder = "邮箱"
        textFeild.clearButtonMode = .always
        textFeild.keyboardType = UIKeyboardType.emailAddress
        textFeild.font = UIFont.systemFont(ofSize: 18)
        textFeild.setValue(UIFont.systemFont(ofSize: 16), forKeyPath: "placeholderLabel.font")
        textFeild.setValue(UIColor.init(byteRed: 0, green: 0, blue: 0, alpha: 0.4), forKeyPath: "placeholderLabel.textColor")
        return textFeild
    }()
    
    lazy var passwdTextFeild: UITextField = {
        let textFeild = UITextField()
        textFeild.placeholder = "密码"
        textFeild.clearButtonMode = .always
        textFeild.isSecureTextEntry = true
//        textFeild.keyboardType = UIKeyboardType.phonePad
        textFeild.font = UIFont.systemFont(ofSize: 18)
        textFeild.setValue(UIFont.systemFont(ofSize: 16), forKeyPath: "placeholderLabel.font")
        textFeild.setValue(UIColor.init(byteRed: 0, green: 0, blue: 0, alpha: 0.4), forKeyPath: "placeholderLabel.textColor")
        return textFeild
    }()
    
    lazy var lineView1: UIView = {
        let v = UIView()
        v.backgroundColor = "E5E5EE".color
        return v
    }()
    
    lazy var lineView2: UIView = {
        let v = UIView()
        v.backgroundColor = "E5E5EE".color
        return v
    }()
    
    
    lazy var comfirmBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(UIColor.white, for: .normal)
        b.setTitleColor(.lightGray, for: .highlighted)
        b.backgroundColor = Color.DefualtColor
        b.addTarget(self, action: #selector(self.comfirmBtnPress(_:)), for: .touchUpInside)
        b.setTitle("确定", for: UIControl.State())
        
        b.layer.cornerRadius = 4
        b.layer.masksToBounds = true
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 18)
        }
        return b
    }()
    
    
    lazy var resetPasswdBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(Color.DefualtColor, for: UIControl.State())
        b.setTitleColor(.lightGray, for: .highlighted)
        b.addTarget(self, action: #selector(self.fogotPasswdBtnPress(_:)), for: .touchUpInside)
        b.setTitle("忘记密码?", for: UIControl.State())
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 16)
        }
        return b
    }()
    
    func setRightNavgation() {
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "注册", style: .plain, target: self, action: #selector(rightButtonAction))
    }
    
    // MARK: layout
    
    func setupLayout() {
        
        logoImageView.snp.makeConstraints { (make) in
            make.centerX.equalTo(view)
            make.centerY.equalTo(view).offset(-140)
            make.width.height.equalTo(120)
        }
        
        emailTextFeild.snp.makeConstraints { (make) in
            make.top.equalTo(logoImageView.snp.bottom).offset(20)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(250)
        }
        
        lineView1.snp.makeConstraints { (make) in
            make.top.equalTo(emailTextFeild.snp.bottom).offset(1)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(emailTextFeild)
            make.height.equalTo(1)
        }
        
        passwdTextFeild.snp.makeConstraints { (make) in
            make.top.equalTo(emailTextFeild.snp.bottom).offset(30)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(emailTextFeild)
        }
        lineView2.snp.makeConstraints { (make) in
            make.top.equalTo(passwdTextFeild.snp.bottom).offset(1)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(emailTextFeild)
            make.height.equalTo(1)
        }
        
        comfirmBtn.snp.makeConstraints { (make) in
            make.top.equalTo(lineView2.snp.bottom).offset(20)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(emailTextFeild)
        }
        resetPasswdBtn.snp.makeConstraints { (make) in
            make.top.equalTo(comfirmBtn.snp.bottom).offset(20)
            make.centerX.equalTo(emailTextFeild)
            
        }
    }
    
    // MARK: - Action
    @objc func rightButtonAction() {
        //注册
        
        let controller = ResetOrRegisterVC()
        controller.type = ResetOrRegisterType.Register.desc
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    @objc func comfirmBtnPress(_: UIButton) {
        if(loginCheck()){
            basicLogin(emailTextFeild.text!, passwdTextFeild.text!)
        }
    }
    
    @objc func fogotPasswdBtnPress(_: UIButton) {
        let controller = ResetOrRegisterVC()
        controller.type = ResetOrRegisterType.Reset.desc
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    @objc func handleTap(sender: UITapGestureRecognizer) {
        self.view.endEditing(true)
    }
    
    fileprivate func loginCheck() -> Bool {
        var valid = true
        if let email = emailTextFeild.text {
            let userNameEmail = email.replacingOccurrences(of: " ", with: "").replacingOccurrences(of: "\n", with: "")
            emailTextFeild.text = userNameEmail
            
            if(isPhoneRegister){
                if (userNameEmail.isEmpty || !userNameEmail.isPhoneNum) {
                    valid = false
                    self.showTextHUD("请输入正确的手机号", dismissAfterDelay: 1.5)
                }
            }else{
                if (userNameEmail.isEmpty || !userNameEmail.isEmail) {
                    valid = false
                    self.showTextHUD("请输入正确的邮箱", dismissAfterDelay: 1.5)
                }
            }
        }
        
        if let pwd = passwdTextFeild.text {
            if (pwd.isEmpty) {
                valid = false
                self.showTextHUD("密码不能为空", dismissAfterDelay: 1.5)
            }
        }
        
        return valid
    }
    
    func basicLogin(_ name:String,_ password:String){
            
        let model = AuthRequestModel()
        model.username = name
        model.password = password
        model.phoneModel = SystemUtil.platform

        self.showProgreeHUD()
        ShadowApiService.instance.BasicLogin(authRequestModel: model,onSuccess: {
            result in
           
            if(result.code == HttpResult.HTTP_OK && result.data != nil){
                LocalTools.instance.saveAuthUser(basicToken: result.data!)
                LocalTools.instance.setUserLoginData(flag: true, account: model.username ?? "", password: model.password ?? "")
                
                //刷新用户信息
                LocalTools.instance.mainViewController?.OnLoginComplete(result: result)
                
                self.showTextHUD("登录成功", dismissAfterDelay: 1.5) {
                    self.navigationController?.popViewController(animated: true)
                }
               
                //登录成功后,如果没有节点需要拉取一次节点
                if LocalTools.instance.getShadowNodeFromLocal().count == 0 {
                    LocalTools.instance.mainViewController?.updateNodes()
                }
            }else{
                self.showTextHUD(result.message ?? "登录失败", dismissAfterDelay: 1.5)

                LocalTools.instance.setUserLoginData()
            }
            
        },onFail:{
            error in
            self.showTextHUD("登录失败", dismissAfterDelay: 1.5)
            LocalTools.instance.setUserLoginData()
    
        })
        
    }
}
