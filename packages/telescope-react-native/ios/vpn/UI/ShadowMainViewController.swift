//
//  ShadowMainViewController.swift

//
//  Created by  on 2020/10/22.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation
import SnapKit
import Async
import SafariServices
import CoreMedia
import Appirater

class ShadowMainViewController: BaseVC,HomePresenterProtocol {
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    
    enum ConnectStatus: Int {
        case UnConnected = 0
        case Connecting = 1
        case Connected = 2
    }
    
    var lastStatus: VPNStatus = VPNStatus.off
    var isAutoLogining = false
    var connectTime = 0
    
    var status: VPNStatus {
        didSet(o) {
          //  hideAndShow(isShow: false)
            print("\(status)")
            
            if(status==VPNStatus.reasserting){
                //status = VPNStatus.off
                self.showTextHUD("VPN连接已断开", dismissAfterDelay: 2.0)
              //  self.sendNotification(data:"VPN连接已断开")
            }
            
            updateConnectButton()
            
            if(lastStatus == VPNStatus.connecting && status == VPNStatus.on){
              //  getIpAndAddress()
            }else{
               // hideAndShow(isShow: false)
            }
            
            lastStatus = status
           
        }
    }
    
    //MARK: - HomePresenter Protocol
    @objc func handleRefreshUI() {
        status = Manager.sharedManager.vpnStatus
       
    }

    @objc func changeProxy() {
        if status == .on || status == .connecting {
            //选择node
            let profile = LocalTools.instance.getActiviteProfile()
            
            if profile != nil {
                var isTelescope = false
                if(profile?.id == -1){
                    isTelescope = true;
                    let shadowServers = LocalTools.instance.getShadowNodeFromLocal()
                    
                    if(LocalTools.instance.AccountCardActive()){
                       
                        var listarray:[ProfileServer] = []
                        
                        for item in shadowServers {
                            if item != nil{
                                listarray.append(item!)
                            }
                        }
                        
                        let model = LocalTools.instance.GetAutoIndex(servers: listarray)
                        if(model != nil){
                            Manager.sharedManager.selectNode = LocalTools.instance.getNodeModelFromProfieServer(profileSever: model!)
                        }
                    }
                 
                    
                }else{
                    isTelescope = profile?.isTelescope ?? false
                    Manager.sharedManager.selectNode  = LocalTools.instance.getNodeModelFromProfieServer(profileSever: profile!)
                }
                
                if(isTelescope && AppData.loggedUser?.status == UserStatus.EXPIRED){
                    showRechargeAlert()
                    Manager.sharedManager.selectNode  = nil
                    return
                }
                
                if isTelescope && AppData.loggedUser == nil {
                    self.showTextHUD("请先登录", dismissAfterDelay: 2)
                }
                
                if(isTelescope){
                    LocalTools.instance.setValueForKey(key: "proxyToChina", value: false)
                }else{
                    if(LocalTools.instance.isIosExternalNode()){
                        LocalTools.instance.setValueForKey(key: "proxyToChina", value: false)
                    }else{
                        LocalTools.instance.setValueForKey(key: "proxyToChina", value: true)
                    }
                }
                
            }
            
            Shadow.sharedUserDefaults().set(Manager.sharedManager.selectNode?.remarks, forKey: kSelectNode)

            Manager.sharedManager.isChangeProxy = true
            presenter.switchVPN()
        }
    }

    @objc func switchVPNNotify() {
        self.handButtonAction()
    }
    
    var navBarHeight = 64
    var keyWindow: UIWindow? {
        return UIApplication.shared.keyWindow
    }

    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        self.status = .off
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
        presenter.bindToVC(self)
        presenter.delegate = self
    }
    
    required init?(coder aDecoder: NSCoder) {
        self.status = .off
        super.init(coder:aDecoder)
        presenter.bindToVC(self)
        presenter.delegate = self
    }
        
    let mainConnectView = MainConnectView()
    
    let menuView = MenuView()
    
    var leftBarItem:UIBarButtonItem? = nil
    
    var rightBarItem:UIBarButtonItem? = nil
    
    var connectingIsAnimation = false
    
    let presenter = HomePresenter()
    var isVpnOn  = false
    var listArray:[ProfileServer] = []
    
    var pingTime: Double = 0
    
//    var normalListArray:[ProfileServer] = []
    
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
                
//        if #available(iOS 15, *) {
//            let app = UINavigationBarAppearance.init()
//            app.configureWithOpaqueBackground()  // 重置背景和阴影颜色
//            app.titleTextAttributes = [NSAttributedString.Key.foregroundColor: Color.DefualtColor ,NSAttributedString.Key.font : UIFont.boldSystemFont(ofSize: 20)]
//            app.backgroundColor = Color.NavigationBackground  // 设置导航栏背景色
//            app.shadowColor = UIColor.clear  // 设置导航栏下边界分割线透明
//            navigationController?.navigationBar.scrollEdgeAppearance = app  // 带scroll滑动的页面
//            navigationController?.navigationBar.standardAppearance = app // 常规页面
//        }
        
        let dict:NSDictionary = [NSAttributedString.Key.foregroundColor: Color.DefualtColor ,NSAttributedString.Key.font : UIFont.boldSystemFont(ofSize: 20)]
        //标题颜色
        navigationController?.navigationBar.titleTextAttributes = dict as? [NSAttributedString.Key : AnyObject]

        //item颜色
        navigationController?.navigationBar.tintColor = Color.DefualtColor
    }
    
    fileprivate func updatePingData() {
        if(self.listArray.count > 0){
            DispatchQueue.main.async {
                NotificationCenter.default.post(name: NSNotification.Name(rawValue: "nodeListReload"), object: nil)
            }
        }
        
        updatePingLabel()
        isPing = false
    }
    
    override func viewDidAppear(_ animated: Bool) {
      
    
        self.OnAdConfigUpdate()
        self.OnChooseUpdate()
        self.OnGetProfileSeverConfig()
        
        self.pingCheck()
        
    }
    
    @objc func applicationDidBecomeActive(notification: NSNotification) {
        // Application is back in the foreground
        
        self.pingCheck()
        print("applicationDidBecomeActive")
    }

    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
        configView()
        setviewConstraint()
        
        LocalTools.instance.mainViewController = self
        
        NotificationCenter.default.addObserver(self, selector: #selector(applicationDidBecomeActive), name: UIApplication.didBecomeActiveNotification, object: nil)

        NotificationCenter.default.addObserver(self, selector: #selector(importActivateCard(info:)), name: NSNotification.Name(rawValue: "importActivateCard"), object: nil)

        Manager.sharedManager.wormhole.listenForMessage(withIdentifier: "tcpping_result") { [unowned self](pingResult)  in
            
            if let pingResultString = pingResult as? String {
                if let pingResultDic = pingResultString.jsonDictionary() as? Dictionary<String, Any> {
                    for (key, value) in pingResultDic {
                        if key == "last" {
                            self.updatePingData()
                        } else {
                            Manager.sharedManager.pingCheckDic[key] = Int(value as! String)!
                        }
                    }
                }
            }
        }

        //separator 切割出来的对象为SubString对象,需要先转换成String
        let allDomains: [String] = LocalTools.instance.getAllDomains().split(separator: ",").compactMap { (item) -> String in
            return "\(item)"
        }
        
        if let firstDomainFromServer = allDomains.first {
            HttpConfig.resetDomain(domain: firstDomainFromServer)
        }
        
        
        //TODO: 测试用
//        Shadow.sharedUserDefaults().set(true, forKey: "iosExamine")

        let userLoginData = LocalTools.instance.getUserLoginData()
        if(userLoginData.isAccountLogin){
            self.isAutoLogining = true

            Async.background {
                self.basicLogin(userLoginData.account, userLoginData.password)
            }
        }else{
            Async.background {
                self.goTrial()
            }
        }
        
        getWebConfig()

        
    }
    
 
    func pingCheck() {
        
        let nowTime = CFAbsoluteTimeGetCurrent()
        
        let seconds = nowTime - pingTime
        debugPrint("Seconds: \(seconds)")
        
        
        if seconds > 50 || pingTime == 0 {
            pingTime = CFAbsoluteTimeGetCurrent()
            if !self.updatingNodes {
                if !self.isPing {
                    self.isPing = true
                    debugPrint("start tcpping")

                    if(!self.isVpnOn){
                        self.startPing {
                            self.updatePingData()
                        }
                    }else{
                        self.pingByWormhole()
                    }
                }
                
            } else {
                sleep(5)
                pingCheck()
            }
        }
        
    }
    
    func configView() {

        view.addSubview(mainConnectView)
        view.addSubview(notifyBarBackgroundView)
        notifyBarBackgroundView.addSubview(notifyBarImageView)
        notifyBarBackgroundView.addSubview(notifyBarLabel)
                
        //状态栏高度
        let statusBarHeight = UIApplication.shared.statusBarFrame.height;
        //导航栏高度
        navBarHeight = Int((statusBarHeight + 44))

        navigationItem.title = "Telescope"
//        navigationItem.backBarButtonItem = self.backBarItem()
        //设置导航栏背景颜色
        
        
        leftBarItem = UIBarButtonItem(image: "app_icon_menu".originalImage, style: .plain, target: self, action: #selector(leftButtonAction))
        rightBarItem =  UIBarButtonItem(image: "app_icon_news".originalImage, style: .plain, target: self, action: #selector(rightButtonAction))
    
        
        navigationItem.leftBarButtonItem = leftBarItem
        navigationItem.rightBarButtonItem = rightBarItem
        
        let tap = UITapGestureRecognizer.init(target: self, action: #selector(handButtonAction))
        mainConnectView.handImageView.addGestureRecognizer(tap)
        mainConnectView.handImageView.isUserInteractionEnabled = true
        
        let tap2 = UITapGestureRecognizer.init(target: self, action: #selector(chooseButtonAction))
        mainConnectView.chooseServerView.addGestureRecognizer(tap2)
        mainConnectView.chooseServerView.isUserInteractionEnabled = true
        
        let notifybarTap = UITapGestureRecognizer.init(target: self, action: #selector(rightButtonAction))
        notifyBarLabel.addGestureRecognizer(notifybarTap)
        notifyBarLabel.isUserInteractionEnabled = true
        notifyBarBackgroundView.addGestureRecognizer(notifybarTap)
        notifyBarBackgroundView.isUserInteractionEnabled = true
        
        let adLabelTap = UITapGestureRecognizer.init(target: self, action: #selector(adLabelAction))
        mainConnectView.adlabel.addGestureRecognizer(adLabelTap)
        mainConnectView.adlabel.isUserInteractionEnabled = true

        let inviteLabelTap = UITapGestureRecognizer.init(target: self, action: #selector(inviteLabelAction))
        mainConnectView.titleLabel.addGestureRecognizer(inviteLabelTap)
        mainConnectView.titleLabel.isUserInteractionEnabled = true
        
        if let keyView = UIApplication.shared.keyWindow?.rootViewController?.view {
            menuView.delegate = self
            menuView.isHidden = true
            keyView.addSubview(menuView)
            menuView.snp.makeConstraints { (make) in
                make.top.equalTo(keyView).offset(navBarHeight)
                make.left.right.bottom.equalTo(keyView)
            }
          
        }
        
//        OnLoadMain()

    }
    
    func setviewConstraint() {

        mainConnectView.snp.makeConstraints{ (make) in
            make.left.right.bottom.equalTo(view)
            make.top.equalTo(view).offset(navBarHeight)
        }
        
        notifyBarBackgroundView.snp.makeConstraints { (make) in
            make.top.equalTo(mainConnectView).offset(16)
            make.left.equalTo(mainConnectView).offset(16)
            make.size.equalTo(CGSize(width: 256, height: 32))
        }
        
        notifyBarImageView.snp.makeConstraints { (make) in
            make.size.equalTo(16)
            make.left.equalTo(notifyBarBackgroundView).offset(16)
            make.centerY.equalTo(notifyBarBackgroundView)
        }
        
        notifyBarLabel.snp.makeConstraints { (make) in
            make.left.equalTo(notifyBarImageView.snp.right).offset(8)
            make.centerY.equalTo(notifyBarBackgroundView)
            make.right.equalTo(notifyBarBackgroundView.snp.right).offset(-16)
        }
    }
    
    lazy var notifyBarBackgroundView: UIView = {
        let v = UIView()

        v.backgroundColor = "d5e4fd".color
        v.layer.masksToBounds = true
        v.layer.cornerRadius = 16
        v.isHidden = true
        
        return v
    }()
    
    lazy var notifyBarImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "app_icon_tips")
        return v
    }()
    
    lazy var notifyBarLabel: UILabel = {
        let v = UILabel()
//        v.textColor = "177FFF".color
        v.textColor = .red
        v.font = UIFont.systemFont(ofSize: 12)
//        v.numberOfLines = 0
//        v.lineBreakMode = NSLineBreakMode.byWordWrapping
        v.textAlignment = .left
        v.text = ""
        
        return v
    }()
    
    
    func hideMenuView() {
        UIView.animate(withDuration: 0.3, animations: {
            self.menuView.bgView.snp.updateConstraints({ (make) in
                make.left.equalTo(self.menuView).offset(-280)
            })
            self.menuView.layoutIfNeeded()

        }) { (_) in
            self.menuView.isHidden = true
        }
    }
    
    func showMenuView() {
        self.menuView.isHidden = false
      
        let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
        
        if iosExamine || LocalTools.instance.AccountCardActive() {
            getUserInfo()
        } else {
            if isAutoLogining == false && ShadowApiService.instance.canNotFindAnyDomainCanUse == false {
                if AppData.loggedUser == nil {
                    let userLoginData = LocalTools.instance.getUserLoginData()
                    if(userLoginData.isAccountLogin){
                        self.isAutoLogining = true
                        basicLogin(userLoginData.account, userLoginData.password)
                    }else{
                        goTrial()
                    }
                }
            }
            getWebConfig()
        }
        
        self.menuView.UpdateUserData(isAutoLoging: self.isAutoLogining)
        
        UIView.animate(withDuration: 0.3) {

            self.menuView.bgView.snp.updateConstraints({ (make) in
                make.left.equalTo(self.menuView).offset(0)
            })
            self.menuView.layoutIfNeeded()

        }
    }
    
    
    func updateConnectButton() {
        switch status {
        case .connecting, .disconnecting:
            chageStatus(status: .Connecting)
        case .on:
            self.isVpnOn = true
            chageStatus(status: .Connected)
        case .off,.reasserting:
            self.isVpnOn = false
            chageStatus(status: .UnConnected)
        }
    }
    
    func startConnectingAnimate() {
        mainConnectView.connectingImageView.isHidden = false
        connectTime += 1
        
        if connectTime >= 30 {
            stopConnectingAnimate()
            self.showTextHUD("连接超时,请稍后重试", dismissAfterDelay: 2)
            Manager.sharedManager.stopVPN()
            
        } else {
            UIView.animate(withDuration: 1, delay: 0, options: .curveLinear) {
                self.mainConnectView.connectingImageView.transform = CGAffineTransform.identity
                self.mainConnectView.connectingImageView.transform = CGAffineTransform(rotationAngle: CGFloat.pi)
            } completion: { (ture) in
                UIView.animate(withDuration: 1, delay: 0, options: .curveLinear) {
                    self.mainConnectView.connectingImageView.transform = CGAffineTransform(rotationAngle: CGFloat.pi * 2)
                } completion: { (ture) in
                    
                    if self.connectingIsAnimation {
                        self.startConnectingAnimate()
                    } else {
                        self.mainConnectView.connectingImageView.transform = CGAffineTransform.identity
                    }
                }
            }
        }
        
    }
    
    func stopConnectingAnimate() {
        connectingIsAnimation = false
        mainConnectView.connectingImageView.isHidden = true
        connectTime = 0
    }
    
    /// 连接状态处理
    /// - Parameter isConnect: 是否已连接
    func chageStatus(status: ConnectStatus) {
        
        if (status == .UnConnected) {
            mainConnectView.statusLabel.text = "点击连接"
            mainConnectView.statusLabel.textColor = Color.DefualtColor
            mainConnectView.pingLabel.isHidden = true
            mainConnectView.handImageView.image = UIImage.init(named: "connect_off")
            
            stopConnectingAnimate()
            
        } else if (status == .Connecting) {
            if lastStatus == .connecting || lastStatus == .on{
                mainConnectView.statusLabel.text = "断开中..."
            }else{
                mainConnectView.statusLabel.text = "连接中..."
            }
            mainConnectView.statusLabel.textColor = Color.DefualtColor
            
            connectingIsAnimation = true
            mainConnectView.handImageView.image = UIImage.init(named: "connect_off")

            startConnectingAnimate()

        
        } else if (status == .Connected) {
            mainConnectView.pingLabel.isHidden = false
            updatePingLabel()
            
            let profile = LocalTools.instance.getActiviteProfile()
            
            if profile?.id == -1 {
                let selectNodeRemarks = Shadow.sharedUserDefaults().object(forKey: kSelectNode) as? String

                mainConnectView.statusLabel.text = "连接成功[\(Manager.sharedManager.selectNode?.remarks ?? (selectNodeRemarks ?? "-"))]"
            }else{
                mainConnectView.statusLabel.text = "连接成功"
            }
           
            stopConnectingAnimate()

            mainConnectView.statusLabel.textColor = .green
            mainConnectView.handImageView.image = UIImage.init(named: "connect_on")
            
        }
        
    }
    
    @objc func leftButtonAction() {
        
        if self.menuView.isHidden == false {
            hideMenuView()
        } else {
            showMenuView()
        }
    }
    
    @objc func rightButtonAction() {
        
        let controller = MessageListViewController()
        controller.hidesBottomBarWhenPushed = true
        self.navigationController?.pushViewController(controller, animated: true)

    }

    @objc func adLabelAction() {
        
        if let adUrl = mainConnectView.mAdModel?.msgLink {
            let vc = FlySafariVC(url: URL(string: adUrl)!)
            vc.delegate = self
            self.present(vc, animated: true, completion: nil)
        }
        
    }
    
    @objc func inviteLabelAction() {
        
        if let webconfig = AppData.webConfig {
            if webconfig.shareAction {
                let shareViewController = ShareViewController()
                shareViewController.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(shareViewController, animated: true)
            }
        }
        
    }
    
    @objc func handButtonAction() { //点击连接,
        print("handButtonAction")
       
        if status == .connecting || status == .disconnecting{
            status = .disconnecting
            presenter.switchVPN()
            return
        }
        
        if status == .on {
            status = .disconnecting
            presenter.switchVPN()

        } else {
            
            //选择node
            let profile = LocalTools.instance.getActiviteProfile()
            
            if profile != nil {
                var isTelescope = false
                if(profile?.id == -1){
                    isTelescope = true;
                    let shadowServers = LocalTools.instance.getShadowNodeFromLocal()
                    
                    var listarray:[ProfileServer] = []
                    
                    for item in shadowServers {
                        if item != nil{
                            listarray.append(item!)
                        }
                    }
                    
                    let model = LocalTools.instance.GetAutoIndex(servers: listarray)
                    if(model != nil){
                        Manager.sharedManager.selectNode  = LocalTools.instance.getNodeModelFromProfieServer(profileSever: model!)
                    }
                 
                    
                }else{
                    isTelescope = profile?.isTelescope ?? false
                    Manager.sharedManager.selectNode  = LocalTools.instance.getNodeModelFromProfieServer(profileSever: profile!)
                }
                
                if(isTelescope && AppData.loggedUser?.status == UserStatus.EXPIRED){
                    
                    showRechargeAlert()
                    Manager.sharedManager.selectNode  = nil
                    return
                }
                
                if(isTelescope){
                    LocalTools.instance.setValueForKey(key: "proxyToChina", value: false)
                }else{
                    if(LocalTools.instance.isIosExternalNode()){
                        LocalTools.instance.setValueForKey(key: "proxyToChina", value: false)
                    }else{
                        LocalTools.instance.setValueForKey(key: "proxyToChina", value: true)
                    }
                }
                Shadow.sharedUserDefaults().set(Manager.sharedManager.selectNode?.remarks, forKey: kSelectNode)

            }else{
                Manager.sharedManager.selectNode = nil
            }
            
            if Manager.sharedManager.selectNode == nil {
                self.showTextHUD("请选择节点", dismissAfterDelay: 1.5)
            } else {
                status = .connecting
                presenter.switchVPN()
            }
        }
    
    }
    
    @objc func chooseButtonAction() {
        print("chooseButtonAction")
        
        let nodeListController = NodeListViewController()
        nodeListController.hidesBottomBarWhenPushed = true
        self.navigationController?.pushViewController(nodeListController, animated: true)

    }

    //ui

    func showRechargeAlert() {
        let alert = UIAlertController(title: "提示", message: "你的会员已过期，您可以及时充值来保持更好的体验", preferredStyle: .alert)
        let cancelAction = UIAlertAction(title: "取消", style: .cancel) { _ in
            
        }
        alert.addAction(cancelAction)
        let compeletedAction = UIAlertAction(title: "马上充值", style: .default) { _ in
            let controller = RechargeViewController()
            controller.hidesBottomBarWhenPushed = true
            self.navigationController?.pushViewController(controller, animated: true)
        }
        alert.addAction(compeletedAction)
        self.present(alert, animated: true) {
            
        }
    }
    
    func OnLoadMain()  {
        
        DispatchQueue.global().async {
            
            self.GetPayChannel()
           
            self.GetAds();
            self.updateNodes()

        }
    }
    
    func OnLoginComplete(result:HttpResponseModel<BasicToken>) {
        if result.code == HttpResult.HTTP_OK{
            OnLoadMain()
            self.getWebConfig()
            self.GetGWFList()
            self.GetDomains()
            LocalTools.instance.userIsLogOut = false
            self.menuView.UpdateUserData(isAutoLoging: self.isAutoLogining)

        } else if result.code == HttpResult.HTTP_998{
            self.navigationController?.hideHUD()

            //网络差的情况,如果用户已经登录成功就不跳转了
            if AppData.loggedUser != nil {
                return
            }
            
            AppData.appNeedAccountLogin = true
            
            if !LocalTools.instance.userIsLogOut && (isAutoLogining == false) {
                if self.menuView.isHidden == false {
                    self.hideMenuView()
                }
                
                self.navigationController?.showTextHUD(result.message ?? "", dismissAfterDelay: 2) {
                    let controller = BindViewController()
                    controller.hidesBottomBarWhenPushed = true
                    self.navigationController?.pushViewController(controller, animated: true)
                }
            } else {
                self.navigationController?.showTextHUD(result.message ?? "", dismissAfterDelay: 2)
                self.menuView.UpdateUserData(isAutoLoging: self.isAutoLogining)
            }
            
        }
    }
    
    func OnLoginError(result:HttpResponseModel<String>) {
      
    }
    
    func OnNormalRequestComplete(result:HttpResponseModel<HttpResponseType>)  {
        switch result.data {
        case .HttpLoginSuccess:
            OnLoadMain()
            break
        case .HttpLoginFailed:
            //如果注册账号在自动登录中,不需要调用试用的接口
            
            if result.code == HttpResult.HTTP_NETWORK_NOT_CONNECT {
                Async.main{
                    self.showTextHUD("你好像没有连接网络,请先连接网络再试", dismissAfterDelay: 2)
                }
            }
            
            //避免无限循环登录,注释以下代码
//            else {
//
//                if isAutoLogining == false && ShadowApiService.instance.canNotFindAnyDomainCanUse == false {
//
//                    if AppData.loggedUser == nil {
//                        let userLoginData = LocalTools.instance.getUserLoginData()
//                        if(userLoginData.isAccountLogin){
//                            self.isAutoLogining = true
//                            basicLogin(userLoginData.account, userLoginData.password)
//                        }else{
//                            goTrial()
//                        }
//                    }
//                }
//            }
            
            break
        default:
            break
        }
    }
    
    //MARK: - Request
    func goTrial(needActivating: String = ""){
        let trial = TrialRequestModel()
        trial.phoneModel = SystemUtil.phoneModel
        trial.imei = SystemUtil.imei
        ShadowApiService.instance.TrailLogin(trialRequestModel: trial,onSuccess:{ result in
            if(result.code == HttpResult.HTTP_OK){
                if(result.data != nil){
                    LocalTools.instance.saveAuthUser(basicToken: result.data!)
                }
                
            }

            DispatchQueue.main.async {
                self.hideHUD()
                self.navigationController?.hideHUD()

                self.OnLoginComplete(result: result)
                
                if needActivating.isEmpty == false {
                    self.activityByCardPassword(cardAndPasswd: needActivating)
                }
            }
            
        },onFail: { error in
            
            var code = HttpResult.HTTP_ERROR
            
            let errorStringArray = error.components(separatedBy: ",##,")
            
            if errorStringArray.count >= 2 {
                code = Int(errorStringArray[1]) ?? HttpResult.HTTP_ERROR
            }
            
            DispatchQueue.main.async {
                self.hideHUD()
                self.navigationController?.hideHUD()

                let res = HttpResponseModel<HttpResponseType>()
                res.code = code
                res.message = "登录失败"
                res.data = HttpResponseType.HttpLoginFailed
                self.OnNormalRequestComplete(result: res)
            }
            
        })
        
    }
   
    @objc func importActivateCard(info: NSNotification) {
        guard let cardAndPasswd = info.userInfo?["cardAndPasswd"] as? String else { return }
        
        activityByCardPassword(cardAndPasswd: cardAndPasswd)

    }
    
    func activityByCardPassword(cardAndPasswd: String) {
        let tmpArray = cardAndPasswd.components(separatedBy: "#")
        
        if tmpArray.count < 2 {
            self.showTextHUD("Card format is wrong, please check".localized(), dismissAfterDelay: 1.5)
            return
        }
        let card = tmpArray[0]
        let passwd = tmpArray[1]
        let channel = tmpArray[2]
        
        let cardModel = CouponRequestModel()
        cardModel.card_number = card
        cardModel.card_password = passwd
        cardModel.channel = channel
        
        self.showProgreeHUD("激活中...")
        ShadowApiService.instance.userActiveByCard(model: cardModel, onSuccess:{ result in
            if(result.code == HttpResult.HTTP_OK){

                DispatchQueue.main.async {
                    Shadow.sharedUserDefaults().set(cardModel.channel, forKey: "channel")

                    //激活成功后,把隐藏功能都打开
                    let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
                    
                    if iosExamine == false {
                        Shadow.sharedUserDefaults().set(true, forKey: "iosExamine")
                    }
                    self.showTextHUD("激活成功", dismissAfterDelay: 2) {
                        self.getWebConfig()
                    }
                    self.getUserInfo()
                    self.updateNodes()
                    if(LocalTools.instance.getActiviteProfile()==nil){
                        LocalTools.instance.selectedProfileServer(model: LocalTools.instance.GetAutoServer())
                    }
                }
            } else if result.code == HttpResult.UNAUTHORIZED_ERROR {
                self.goTrial(needActivating: cardAndPasswd)
            } else {
                DispatchQueue.main.async {
                    self.showTextHUD(result.message, dismissAfterDelay: 1.5)
                }
            }
          
          
        },onFail: { error in
            
            DispatchQueue.main.async {
                self.showTextHUD("激活失败", dismissAfterDelay: 1.5)
            }
          
        },token: AppData.authUser?.token)
    }
    
    func basicLogin(_ name:String,_ password:String){

        let model = AuthRequestModel()
        model.username = name
        model.password = password
        model.phoneModel = SystemUtil.platform

        ShadowApiService.instance.BasicLogin(authRequestModel: model,onSuccess: {
            result in
           
            if(result.code == HttpResult.HTTP_OK && result.data != nil) {
                LocalTools.instance.saveAuthUser(basicToken: result.data!)
                LocalTools.instance.setUserLoginData(flag: true, account: model.username ?? "", password: model.password ?? "")
               
                //登录成功后,如果没有节点需要拉取一次节点
                if LocalTools.instance.getShadowNodeFromLocal().count == 0 {
                    self.updateNodes()
                }
                
                DispatchQueue.main.async {
                    self.isAutoLogining = false
                    self.hideHUD()
                }
            } else {
                DispatchQueue.main.async {
                    self.isAutoLogining = false

                    self.showTextHUD(result.message ?? "登录失败", dismissAfterDelay: 1.5)

                    let res = HttpResponseModel<HttpResponseType>()
                    res.code = HttpResult.HTTP_ERROR
                    res.message = "登录失败"
                    res.data = HttpResponseType.HttpLoginFailed
                    //密码不正确的情况不要再重试登录
                    if result.message == "密码不正确" {
                        //清空保存的账号和密码
                        LocalTools.instance.setUserLoginData()

                        let controller = BindViewController()
                        controller.hidesBottomBarWhenPushed = true
                        self.navigationController?.pushViewController(controller, animated: true)
                    } else {
                        self.OnNormalRequestComplete(result: res)
                    }
                    
                }
            }
            
        },onFail:{
            error in

            DispatchQueue.main.async {
                self.isAutoLogining = false

                self.showTextHUD("登录失败", dismissAfterDelay: 1.5)

                let res = HttpResponseModel<HttpResponseType>()
                res.code = HttpResult.HTTP_ERROR
                res.message = "登录失败"
                res.data = HttpResponseType.HttpLoginFailed
                self.OnNormalRequestComplete(result: res)
            }
                
        })
        
    }
    
   func getUserInfo(){
    
       ShadowApiService.instance.GetUserInfo(onSuccess: {
           result in
           if result.code == HttpResult.HTTP_OK{
               if result.data != nil{
                   LocalTools.instance.updateAuthUser(authUser: AppData.authUser!,user: result.data)
                   DispatchQueue.main.async {
                       self.menuView.UpdateUserData(isAutoLoging: self.isAutoLogining)
                   }
               }
               DispatchQueue.main.async {
                   let res = HttpResponseModel<HttpResponseType>()
                   res.code = HttpResult.HTTP_OK
                   res.message = "登录成功"
                   res.data = HttpResponseType.HttpLoginSuccess
                   self.OnNormalRequestComplete(result: res)
               }
               
           }else{
               DispatchQueue.main.async {
                   let res = HttpResponseModel<HttpResponseType>()
                   res.code = HttpResult.HTTP_ERROR
                   res.message = "登录失败"
                   res.data = HttpResponseType.HttpLoginFailed
                   self.OnNormalRequestComplete(result: res)
               }
           }
       }, onFail: {error in
           DispatchQueue.main.async {
               let res = HttpResponseModel<HttpResponseType>()
               res.code = HttpResult.HTTP_ERROR
               res.message = "登录失败"
               res.data = HttpResponseType.HttpLoginFailed
               self.OnNormalRequestComplete(result: res)
           }
       }, token: AppData.authUser?.token)
   }
   
   func getWebConfig() {
       ShadowApiService.instance.getWebConfig(onSuccess: {
           result in
           if(result.code == HttpResult.HTTP_OK && result.data != nil){
               AppData.webConfig = result.data


               let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
               
               if iosExamine == false {
                   Shadow.sharedUserDefaults().set(AppData.webConfig!.iosExamine, forKey: "iosExamine")
               }

               
               if AppData.webConfig!.shareAction && iosExamine {
                   self.mainConnectView.titleLabel.text = "邀请有奖<--"
                   self.mainConnectView.titleLabel.textColor = .red
                   self.mainConnectView.titleLabel.font = UIFont.systemFont(ofSize: 18)

               } else {
                   self.mainConnectView.titleLabel.text = "请点击中心按钮"
                   self.mainConnectView.titleLabel.textColor = .black
                   self.mainConnectView.titleLabel.font = UIFont.systemFont(ofSize: 20)
               }
           }
       },token:AppData.authUser?.token )
      
   }
    
    func GetAds() {
        ShadowApiService.instance.GetAD(onSuccess: {
            result in
            if result.code == HttpResult.HTTP_OK && result.data != nil{
                
                let serverAd = result.data!
                let adJson = LocalTools.instance.getAdsFromLocal()
                var hasNoRead = false
                var newsMap = [String:Bool]()
                adJson.forEach({
                    item in
                    if(item?.msgType == "msg"){
                        newsMap[(item?.title!)!] = item?.read
                    }
                })
                
                serverAd.forEach({
                    item in
                    if(item.msgType == "msg"){
                        if let flag = newsMap[item.title!]{
                            item.read = flag
                        }
                        if(item.read != true){
                            hasNoRead = true
                        }
                    }
                })
                
                LocalTools.instance.setValueForKey(key: "ads", value: serverAd.toJSONString())
                LocalTools.instance.setValueForKey(key: "hasNoRead", value: hasNoRead)
                DispatchQueue.main.async {
                    self.OnAdConfigUpdate()
                }
            }
        })
    }

    
    
    func GetPayChannel(){
        if(AppData.authUser != nil){
            ShadowApiService.instance.GetChannels(onSuccess: {
                result in
                if(result.code == HttpResult.HTTP_OK && result.data != nil){
                    LocalTools.instance.setValueForKey(key: "payChannels", value: result.data?.toJSONString())
                   
                }
                
            },token:AppData.authUser?.token )
        }
    }
    
    func GetGWFList()  {
    
        if(AppData.authUser != nil){
            var currentVersion = LocalTools.instance.getValueForKeyInt(key: "gwflistVersionCurrentUse")
            if (currentVersion < 0)
            {
                currentVersion = 0;
            }
            let model = GWFListRequestModel()
            model.oldVersion = currentVersion
            
            ShadowApiService.instance.GetGWFList(model: model,onSuccess: {
                result in
                if(result.code == HttpResult.HTTP_OK && result.data != nil){
                    
                    LocalTools.instance.setValueForKey(key: "configGfwInfo", value: result.data?.toJSONString())
                    if(result.data!.version! > currentVersion && !result.data!.fileUrl!.isEmpty){
                        Manager.sharedManager.downloadDefaultConfAndUpdate(result.data!.fileUrl!)
                    }
                }
                
            },token:AppData.authUser?.token )
        }
    }
    
    func GetDomains() {
        var domains = ""
        if(AppData.authUser != nil){
            ShadowApiService.instance.GetDomains(onSuccess: {
                result in
                if(result.code == HttpResult.HTTP_OK && result.data != nil) {
                    
                    if let items = result.data {
                        for (i, item) in items.enumerated() {
                            if let address = item.address {
                                domains = domains.appending(address)
                                if (i != (items.endIndex - 1)) {
                                    domains  = domains.appending(",")
                                }
                            }
                        }
                    }
                    
                    if(!domains.isEmpty){
                        LocalTools.instance.setValueForKey(key: "AllApiDomains", value: domains)
                    }
                }
                
            },token:AppData.authUser?.token )
        }
    }
    
    //MARK: - Updates
    var updatingNodes = false
    var isPing = false
    
    func updateNodes(){
        if(AppData.authUser != nil){
            updatingNodes = true
            ShadowApiService.instance.GetServers(onSuccess: {
                result in
                self.updatingNodes = false
                if(result.code == HttpResult.HTTP_OK && result.data != nil){
                    self.updateServersFrom(profileServers: result.data!)
                    DispatchQueue.main.async {
                        NotificationCenter.default.post(name: NSNotification.Name(rawValue: "nodeListReload"), object: nil)
                    }
                }
                
            },onFail:{
                error in
                self.updatingNodes = false
                
            },token:AppData.authUser?.token )
        }
    }
    
    func updatePingLabel() {
        
        var hp = ""
        var isAutoIndex = false
        if let profile = LocalTools.instance.getActiviteProfile() {
            if profile.id == -1 {
                isAutoIndex = true
                if let selectNodeRemarks = Shadow.sharedUserDefaults().object(forKey: kSelectNode) as? String {
                    if let autoIndexProfile = LocalTools.instance.getAutoIndexProfileByRemark(nodeRemark: selectNodeRemarks) {
                        hp = autoIndexProfile.ip! + String(autoIndexProfile.port!)
                    }
                }
            } else {
                hp = profile.ip! + String(profile.port!)
            }
        }
        
        if !hp.isEmpty {
            if let delay = Manager.sharedManager.pingCheckDic[hp] as? Int {
                if 0 < delay && delay < 500 {
                    mainConnectView.pingLabel.text = "正常 \(delay) ms"
                    mainConnectView.pingLabel.textColor = Color.DefualtColor
                } else if delay > 500 {
                    mainConnectView.pingLabel.text = isAutoIndex ? "繁忙 请尝试重新连接" : "繁忙 请尝试切换节点"
                    mainConnectView.pingLabel.textColor = .red
                } else if delay < 0 {
                    mainConnectView.pingLabel.text = isAutoIndex ? "超时 请尝试重新连接" : "超时 请尝试切换节点"
                    mainConnectView.pingLabel.textColor = .red
                }
            }
        } else {
            mainConnectView.pingLabel.text = ""
        }
    }
    
    func updateServersFrom(profileServers:[ProfileServer]) {
        
        var activiteId:Int64 = -1

        if let activiteNode = LocalTools.instance.getActiviteProfile() {
            activiteId = activiteNode.id ?? -1
        }
        
        var found = false
        for item in profileServers {
            item.isTelescope = true
            if let itemId = item.id {
                if itemId == activiteId {
                    found = true
                }
            }

        }
        
        if found == false {
            LocalTools.instance.selectedProfileServer(model: LocalTools.instance.GetAutoServer())
            OnChooseUpdate()
        }
    
        UserDefaults.standard.set(profileServers.toJSONString(), forKey: "shadowServerNodes")
        
        listArray.removeAll()
        if(LocalTools.instance.AccountCardActive()){
            listArray.append(contentsOf: profileServers)
        }
  
     }
}

extension ShadowMainViewController:MenuViewDelegate{
    func didSelectRow(index: Int) {
        
        if(LocalTools.instance.AccountCardActive()){
            switch index {
            case 0:
                //卡券
                hideMenuView()

                let controller = CouponViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                break
            case 1:
                //充值
                hideMenuView()

                let controller = RechargeViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                break
            case 2:
                //扫一扫
                hideMenuView()

                let controller = QQScanViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                break
            case 3:
                //帮助中心
                
                if let helpUrl = AppData.webConfig?.helpUrl {
                    let vc = FlySafariVC(url: URL(string: helpUrl)!)
                    vc.delegate = self
                    self.present(vc, animated: true, completion: nil)
                } else {
                    self.showTextHUD("网络错误,请稍候再试", dismissAfterDelay: 1.5)
                }
                
                break
            case 4:
                //在线客服
                hideMenuView()

                let controller = ShadowCrispViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                
                break
                
            case 5:
                //代理模式
                showProxyTypeActionSheet()
                break
            case 6:
                //评分
                Appirater.rateApp()
                break
            case 7:
                //关于
                hideMenuView()

                let controller = AboutViewController()
                controller.hidesBottomBarWhenPushed = true
                
                self.navigationController?.pushViewController(controller, animated: true)
                break
//            case 8:
//                hideMenuView()
//
//                navigationController?.pushViewController(LogDetailVC(), animated: true)
//                break
//            case 9:
//                hideMenuView()
//
//                navigationController?.pushViewController(SSRLogDetailVC(), animated: true)
//                break
//            case 10:
//                hideMenuView()
//
//                navigationController?.pushViewController(GostLogDetailVC(), animated: true)
//                break
            default:
                break
            }
        }else{
            switch index {
            case 0:
                //充值
                hideMenuView()

                let controller = RechargeViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                break
//            case 1:
//                hideMenuView()
//
//                let controller = QQScanViewController()
//                controller.hidesBottomBarWhenPushed = true
//                self.navigationController?.pushViewController(controller, animated: true)
//                break
            case 1:
                hideMenuView()

                let controller = ShadowCrispViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                
                break
                
            case 2:
                showProxyTypeActionSheet()

                break
            case 3:
                Appirater.rateApp()

                break
            case 4:
                hideMenuView()

                let controller = AboutViewController()
                controller.hidesBottomBarWhenPushed = true
                
                self.navigationController?.pushViewController(controller, animated: true)
                break
            default:
                break
            }
        }
       
    }
    
    func didHideMenuView() {
        hideMenuView()
    }
    
    func didBindBtnClick() {
        if isAutoLogining {
            return
        }
        
        if AppData.loggedUser != nil {
            let it = AppData.loggedUser!
            if(!AppData.isTrailUser(user: it)){
                
                Alert.show(self, title: "是否登出", message: "", confirmMessage: "OK".localized(), confirmCallback: {
                    //如果已连接的状态,登出的时候需要先断开
                    if self.status == .on {
                        self.status = .disconnecting
                        self.presenter.switchVPN()
                    }
                    
                    //清除节点
                    LocalTools.instance.deleteAllShadowNodeFromLocal()
                    self.listArray.removeAll()

                    AppData.authUser = nil
                    AppData.loggedUser = nil
                    
                    //把选择节点设置为自动
                    LocalTools.instance.setAutoActiviteProfile()
                    LocalTools.instance.setUserLoginData()
                    LocalTools.instance.userIsLogOut = true
                    self.menuView.UpdateUserData(isAutoLoging: self.isAutoLogining)
                }, cancelMessage: "Cancel".localized()) {
                    
                }

            }else{
                hideMenuView()

                let controller = BindViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                
            }
            
        }else{
            if(AppData.appNeedAccountLogin){
                hideMenuView()

                let controller = BindViewController()
                controller.hidesBottomBarWhenPushed = true
                self.navigationController?.pushViewController(controller, animated: true)
                
            }else{
                self.navigationController?.showProgreeHUD()
                goTrial()
            }
        }
    }
    
    
    func showProxyTypeActionSheet() {
        let actionSheetAlert = UIAlertController(title: "切换代理模式", message: "", preferredStyle: .actionSheet)
        let cancelActionButton = UIAlertAction(title: "Cancel".localized(), style: .cancel) { _ in
                print("Cancel")
            }
        actionSheetAlert.addAction(cancelActionButton)
        
        var globalString = "全局"
        var chinaOutString = "智能"
        
        if let proxyMode = Shadow.sharedUserDefaults().string(forKey: "ProxyModeType") {
            if proxyMode == ProxyModeType.Global.desc {
                globalString = "全局 ✓"
                chinaOutString = "智能"
            } else {
                globalString = "全局"
                chinaOutString = "智能 ✓"
            }
        } else {
            globalString = "全局"
            chinaOutString = "智能 ✓"
        }
        
        let globalActionBtn = UIAlertAction(title: globalString, style: .default) { _ in
            self.menuView.tableView.reloadData()
            Shadow.sharedUserDefaults().set(ProxyModeType.Global.desc, forKey: "ProxyModeType")
            self.changeProxy()

        }
        
        actionSheetAlert.addAction(globalActionBtn)
        
        let chinaOutActionBtn = UIAlertAction(title: chinaOutString, style: .default) { _ in
            self.menuView.tableView.reloadData()
            Shadow.sharedUserDefaults().set(ProxyModeType.ChinaOut.desc, forKey: "ProxyModeType")
            self.changeProxy()

        }
        
        if let popoverController = actionSheetAlert.popoverPresentationController {
            popoverController.sourceView = self.view //to set the source of your alert
            popoverController.sourceRect = CGRect(x: self.view.bounds.midX, y: self.view.bounds.midY, width: 0, height: 0) // you can set this as per your requirement.
            popoverController.permittedArrowDirections = [] //to hide the arrow of any particular direction
        }
        actionSheetAlert.addAction(chinaOutActionBtn)

        self.present(actionSheetAlert, animated: true) {
        }
    }
}



extension ShadowMainViewController: SFSafariViewControllerDelegate {
    
    @objc func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
        controller.dismiss(animated: true) {
        }
    }
    
}


extension ShadowMainViewController {
    
    func OnGetProfileSeverConfig(){
        
        
        let shadowServers = LocalTools.instance.getShadowNodeFromLocal()
//        let normalServers = LocalTools.instance.getNormalNodeFromLocal()
        var _listArray:[ProfileServer] = []
        
//        var _normalListArray:[ProfileServer] = []
        
        if shadowServers.count > 0{
            for item in shadowServers {
                if item != nil{
                    _listArray.append(item!)
                }
                
            }
            
        }
        if(_listArray.count>0){
            listArray.removeAll()
            listArray.append(contentsOf: _listArray)
        }
//        if normalServers.count > 0{
//            for item in normalServers {
//                if item != nil{
//                    _normalListArray.append(item!)
//                }
//
//            }
//        }
//        if(_normalListArray.count>0){
//            normalListArray.removeAll()
//            normalListArray.append(contentsOf: _normalListArray)
//        }
    }
    
    func OnChooseUpdate()  {
        let model = LocalTools.instance.getActiviteProfile()
        if model != nil{
            mainConnectView.chooseServerView.updateModel(model: model!)
        }
        
        
    }
    
    func OnAdConfigUpdate()  {
        let adJson = LocalTools.instance.getAdsFromLocal()
        var hasNoRead = false
        if(adJson.count > 0){
            var msgModel:AdModel? = nil
            var adModel:AdModel? = nil
            
            adJson.forEach({
                item in
                if(item != nil){
                    let it = item!
                    if it.msgType == "msg" {
                        if(msgModel == nil){
                            msgModel = it
                        }
                        if it.read != true && !hasNoRead{
                            hasNoRead = true
                        }
                    }else if(it.msgType == "ad"){
                        if(adModel == nil){
                            adModel = it
                            
                        }
                    }
                   
                }
               
            })
            
            UpdateAd(msgModel,adModel,hasNoRead: hasNoRead)
        }
    }
    
    func  UpdateAd(_ msgModel:AdModel?,_ adModel:AdModel?,hasNoRead:Bool = false){
        mainConnectView.mMsgModel = msgModel
        mainConnectView.mAdModel = adModel
        if msgModel != nil{
            notifyBarBackgroundView.isHidden = false
            notifyBarLabel.text = msgModel?.title ?? ""
        }else{
            notifyBarBackgroundView.isHidden = true
        }
        
        if mainConnectView.mAdModel != nil && LocalTools.instance.AccountCardActive() {
            mainConnectView.adlabel.isHidden = false
            mainConnectView.adlabel.text = mainConnectView.mAdModel?.title ?? ""
        }else{
            mainConnectView.adlabel.isHidden = true
        }
        
        if hasNoRead{
            rightBarItem?.image = "app_icon_newss".originalImage
        }else{
            rightBarItem?.image = "app_icon_news".originalImage
        }
    }
    
    func startPing(_ completed: @escaping () -> ()) {
        self.OnGetProfileSeverConfig()

        for node in listArray {
            TcpPingBridge.start(node.ip, port: UInt(node.port!), count: 3) { avg in
                var pingResult = -1
                if let avg = avg { pingResult = avg }
                Manager.sharedManager.pingCheckDic["\(node.ip ?? "")\(node.port ?? 0)"] = pingResult
            }
        }
        
//        for node in normalListArray {
//            QNNTcpPing.start(node.ip, port: UInt(node.port!), count: 3, output: self) { (r) in
//                var pingResult = -1
//                if (r?.loss)! == 0 {
//                    pingResult = NSNumber(value: (r?.avgTime)!).intValue
//                }
//                Manager.sharedManager.pingCheckDic["\(node.ip ?? "")\(node.port ?? 0)"] = pingResult
//
//            }
//        }
        
//        QNNTcpPing.start("127.0.0.1", port: UInt(8118), count: 3, output: self) { (r) in
//            var pingResult = -1
//            if (r?.loss)! == 0 {
//                pingResult = NSNumber(value: (r?.avgTime)!).intValue
//            }
//            print("127.0.0.1:8118  \(pingResult)")
//        }
//        QNNTcpPing.start("127.0.0.1", port: UInt(8119), count: 3, output: self) { (r) in
//            var pingResult = -1
//            if (r?.loss)! == 0 {
//                pingResult = NSNumber(value: (r?.avgTime)!).intValue
//            }
//            print("127.0.0.1:8119  \(pingResult)")
//        }
//        QNNTcpPing.start("127.0.0.1", port: UInt(11811), count: 3, output: self) { (r) in
//            var pingResult = -1
//            if (r?.loss)! == 0 {
//                pingResult = NSNumber(value: (r?.avgTime)!).intValue
//            }
//            print("127.0.0.1:11811  \(pingResult)")
//        }
        
        completed()
    }
    
    func pingByWormhole() {
//        QNNTcpPing.start("127.0.0.1", port: UInt(8118), count: 3, output: self) { (r) in
//            var pingResult = -1
//            if (r?.loss)! == 0 {
//                pingResult = NSNumber(value: (r?.avgTime)!).intValue
//            }
//            print("127.0.0.1:8118  \(pingResult)")
//        }
//        QNNTcpPing.start("127.0.0.1", port: UInt(8119), count: 3, output: self) { (r) in
//            var pingResult = -1
//            if (r?.loss)! == 0 {
//                pingResult = NSNumber(value: (r?.avgTime)!).intValue
//            }
//            print("127.0.0.1:8119  \(pingResult)")
//        }
//        QNNTcpPing.start("127.0.0.1", port: UInt(11811), count: 3, output: self) { (r) in
//            var pingResult = -1
//            if (r?.loss)! == 0 {
//                pingResult = NSNumber(value: (r?.avgTime)!).intValue
//            }
//            print("127.0.0.1:11811  \(pingResult)")
//        }
        self.OnGetProfileSeverConfig()

        var pingDic: Dictionary<String, Any> = [:]
        for node in listArray {
            let host = node.ip!
            let port = node.port!
            pingDic[host + String(port)] = port
        }

//        for node in normalListArray {
//            let host = node.ip!
//            let port = node.port!
//            pingDic[host + String(port)] = port
//        }
        Manager.sharedManager.wormhole.passMessageObject((pingDic as NSDictionary).jsonString() as NSCoding?, identifier: "tcpping")
    }
}
