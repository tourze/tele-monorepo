//
//  ResetOrRegisterVC.swift
//  Telescope
//
//  Created by LEI on 2021/6/22.
//  Copyright © 2021 TouchingApp. All rights reserved.
//

import Foundation

public enum ResetOrRegisterType: String {
    case Reset = "Reset"
    case Register = "Register"
}

extension ResetOrRegisterType: CustomStringConvertible {
    
    public var description: String {
        return rawValue.localized()
    }
    
    public var desc: String {
        return rawValue
    }
}

class ResetOrRegisterVC: UIViewController {
    
    public var type = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if type == ResetOrRegisterType.Reset.desc {
            title = "重置密码"
        } else {
            title = "注册"
        }
        
        view.backgroundColor = .white
        
    
        view.addSubview(logoImageView)
        view.addSubview(emailTextFeild)
        view.addSubview(lineView1)
        view.addSubview(passwdTextFeild)
        view.addSubview(lineView2)
        view.addSubview(sendCodeBtn)
        view.addSubview(codeTextFeild)
        view.addSubview(lineView3)

        view.addSubview(comfirmBtn)
        
        
        setupLayout()
        
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
        if type == ResetOrRegisterType.Reset.desc {
            textFeild.placeholder = "新密码"
        } else {
            textFeild.placeholder = "密码"
        }
        textFeild.clearButtonMode = .always
        textFeild.isSecureTextEntry = true
//        textFeild.keyboardType = UIKeyboardType.phonePad
        textFeild.font = UIFont.systemFont(ofSize: 18)
        textFeild.setValue(UIFont.systemFont(ofSize: 16), forKeyPath: "placeholderLabel.font")
        textFeild.setValue(UIColor.init(byteRed: 0, green: 0, blue: 0, alpha: 0.4), forKeyPath: "placeholderLabel.textColor")
        return textFeild
    }()
    
    lazy var codeTextFeild: UITextField = {
        let textFeild = UITextField()
        textFeild.placeholder = "验证码"
        textFeild.clearButtonMode = .always
        textFeild.keyboardType = UIKeyboardType.numberPad
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
    
    lazy var lineView3: UIView = {
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
    
    lazy var sendCodeBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(Color.DefualtColor, for: UIControl.State())
        b.setTitleColor(.lightGray, for: .highlighted)
        b.addTarget(self, action: #selector(self.sendCodeBtnPress(_:)), for: .touchUpInside)
        b.setTitle("发送验证码", for: UIControl.State())
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 16)
        }
        return b
    }()
    
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
        
        sendCodeBtn.snp.makeConstraints { (make) in
            make.top.equalTo(passwdTextFeild.snp.bottom).offset(27)
            make.right.equalTo(emailTextFeild)
        }
        codeTextFeild.snp.makeConstraints { (make) in
            make.left.equalTo(emailTextFeild)
            make.centerY.equalTo(sendCodeBtn)
            make.right.equalTo(sendCodeBtn.snp.left).offset(-5)
        }
        
        lineView3.snp.makeConstraints { (make) in
            make.top.equalTo(sendCodeBtn.snp.bottom).offset(1)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(emailTextFeild)
            make.height.equalTo(1)
        }
        
        comfirmBtn.snp.makeConstraints { (make) in
            make.top.equalTo(lineView3.snp.bottom).offset(20)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(emailTextFeild)
        }

    }
    
    // MARK: - Action
    
    @objc func comfirmBtnPress(_: UIButton) {
        if type == ResetOrRegisterType.Reset.desc {
            resetPassword()
        } else {
            registerAccount()
        }
    }
    
    @objc func sendCodeBtnPress(_: UIButton) {
        
        let captcha = CaptchaRequestModel()

        if let email = emailTextFeild.text {
            let userNameEmail = email.replacingOccurrences(of: " ", with: "").replacingOccurrences(of: "\n", with: "")
            if (userNameEmail.isEmpty || !userNameEmail.isEmail) {
                self.showTextHUD("请输入正确的邮箱", dismissAfterDelay: 1.5)
                return
            }
            emailTextFeild.text = userNameEmail
            captcha.username = email
        }
        
        if type == ResetOrRegisterType.Reset.desc {
            captcha.type = "reset_pass"
        }
        getCode(model: captcha)
    }
    
    @objc func handleTap(sender: UITapGestureRecognizer) {
        self.view.endEditing(true)
    }
    
    // MARK: - Requests
    
    func resetPassword() {
        self.showProgreeHUD()
        let model = ResetPasswordModel()
        
        if let email = emailTextFeild.text {
            if (email.isEmpty){
                self.showTextHUD("邮箱不能为空", dismissAfterDelay: 1.5)
                return
            } else if (!email.isEmail) {
                self.showTextHUD("邮箱格式不正确", dismissAfterDelay: 1.5)
                return
            }
            model.username = email

        }
        
        if let passwd = passwdTextFeild.text {
            if passwd.isEmpty {
                self.showTextHUD("密码不能为空", dismissAfterDelay: 1.5)
                return
            }
            model.password = passwd
        }
        
        if let captcha = codeTextFeild.text {
            if captcha.isEmpty {
                self.showTextHUD("验证码不能为空", dismissAfterDelay: 1.5)
                return
            }
            model.captcha = captcha
        }
        
        ShadowApiService.instance.ResetAccountPassword(resetPasswordModel: model,onSuccess: {
            result in
           
            if(result.code == HttpResult.HTTP_OK ){
                LocalTools.instance.setUserLoginData(flag: true, account: model.username , password: model.password )
                
                self.showTextHUD(result.message ?? "修改成功", dismissAfterDelay: 2) {
                    self.navigationController?.popViewController(animated: true)
                }
               
            }else{
                self.showTextHUD(result.message ?? "修改失败", dismissAfterDelay: 2)
            }
            
        },onFail:{
            error in
            self.showTextHUD("修改失败", dismissAfterDelay: 2)
        })
    }
    
    func registerAccount() {
        
        self.showProgreeHUD()
        let model = RegisterModel()
        if let email = emailTextFeild.text {
            if (email.isEmpty){
                self.showTextHUD("邮箱不能为空", dismissAfterDelay: 1.5)
                return
            } else if (!email.isEmail) {
                self.showTextHUD("邮箱格式不正确", dismissAfterDelay: 1.5)
                return
            }
            model.username = email

        }
        
        if let passwd = passwdTextFeild.text {
            if passwd.isEmpty {
                self.showTextHUD("密码不能为空", dismissAfterDelay: 1.5)
                return
            }
            model.password = passwd
        }
        
        if let captcha = codeTextFeild.text {
            if captcha.isEmpty {
                self.showTextHUD("验证码不能为空", dismissAfterDelay: 1.5)
                return
            }
            model.captcha = captcha
        }
        
        model.passwordConfirmation = model.password
        model.phoneModel = SystemUtil.phoneModel
        
        ShadowApiService.instance.RegisterAccount(registerModel: model,onSuccess: {
            result in
           
            if(result.code == HttpResult.HTTP_OK ){
                LocalTools.instance.saveAuthUser(basicToken: result.data!)

                LocalTools.instance.setUserLoginData(flag: true, account: model.username , password: model.password )
                
                //刷新用户信息
                LocalTools.instance.mainViewController?.OnLoginComplete(result: result)
                
                //登录成功后,如果没有节点需要拉取一次节点
                if LocalTools.instance.getShadowNodeFromLocal().count == 0 {
                    LocalTools.instance.mainViewController?.updateNodes()
                }
                
                self.showTextHUD(result.message ?? "注册成功", dismissAfterDelay: 2) {
                    self.navigationController?.popToRootViewController(animated: true)
                }
                                
            }else{
                self.showTextHUD(result.message ?? "注册失败", dismissAfterDelay: 2)
            }
            
        },onFail:{
            error in
            self.showTextHUD("注册失败", dismissAfterDelay: 2)
        })
     }
    
    func getCode(model: CaptchaRequestModel)  {
        self.showProgreeHUD()
        ShadowApiService.instance.GetCaptcha(model:model, onSuccess: {
            result in
           
            if(result.code == HttpResult.HTTP_OK){
                self.showTextHUD(result.message ?? "验证码已发送，请查收", dismissAfterDelay: 2)
                
                self.sendCodeBtn.isEnabled = false
               
                DispatchQueue.global().async {
                    var count = 60
                    while(count>0){
                        count-=1
                       
                        DispatchQueue.main.async {
                            self.sendCodeBtn.setTitle("\(count)", for: .normal)
                        }
                        sleep(1)
                    }
                    DispatchQueue.main.async {
                        self.sendCodeBtn.isEnabled = true
                        self.sendCodeBtn.setTitle("发送验证码", for: .normal)
                    }
                   
                }
            }else{
                self.showTextHUD(result.message ?? "获取验证码失败,请稍后重试", dismissAfterDelay: 2)
            }
            
        },onFail:{
            error in
            debugPrint(error)
            self.showTextHUD("获取验证码失败,请稍后重试", dismissAfterDelay: 2)
        })
    }
    
}
