//
//  RechargeViewController.swift
//  Telescope
//
//  Created by LEI on 2021/6/10.
//  Copyright © 2021 TouchingApp. All rights reserved.
//

import Foundation
import SafariServices
import Async
import SwiftyStoreKit
import HandyJSON

private let rowHeight: CGFloat = 113

private let kRechargeCellIdentifier = "RechargeCell"

class RechargeViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, SFSafariViewControllerDelegate {

    var mProducts:[Product] = []
    var inPurchaseProduct: Dictionary<String, Any> = [:]
    var productSelected: Product?
    var orderNo:String = ""


    override func viewDidLoad() {
        super.viewDidLoad()
        
        title  = "订购"
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "充值记录", style: .plain, target: self, action: #selector(rightButtonAction))

        
        view.addSubview(tableView)
        tableView.register(RechargeCell.self, forCellReuseIdentifier: kRechargeCellIdentifier)
        
        view.addSubview(bottomView)
        bottomView.addSubview(bottomTitleLabel)
        bottomView.addSubview(priceLabel)
        bottomView.addSubview(comfirmBtn)
        
        setupLayout()
        getRechargeData()

    }

    
    func setupLayout() {
        tableView.snp.makeConstraints { (make) in
            make.left.equalToSuperview()
            make.top.equalToSuperview()
            make.width.equalToSuperview()
            make.bottom.equalTo(view.snp.bottom).offset(-60)
        }
        
        bottomView.snp.makeConstraints { (make) in
            make.top.equalTo(tableView.snp.bottom)
            make.left.equalToSuperview()
            make.right.equalToSuperview()
            make.bottom.equalToSuperview()
        }
        
        bottomTitleLabel.snp.makeConstraints { (make) in
            make.top.equalTo(bottomView).offset(30)
            make.left.equalTo(bottomView).offset(16)
        }
        
        priceLabel.snp.makeConstraints { (make) in
            make.left.equalTo(bottomTitleLabel.snp.right)
            make.top.equalTo(bottomView).offset(24)
        }
        
        comfirmBtn.snp.makeConstraints { (make) in
            make.right.equalTo(bottomView.snp.right).offset(-16)
            make.centerY.equalTo(bottomView)
            make.size.equalTo(CGSize(width: 120, height: 44))

        }
    }
    
    lazy var tableView: UITableView = {
        let v = UITableView(frame: CGRect.zero, style: .plain)
        v.dataSource = self
        v.delegate = self
        v.tableFooterView = UIView()
        v.tableHeaderView = UIView()
        v.separatorStyle = .none
        v.rowHeight = rowHeight
        v.backgroundColor = "F3F4F6".color

        return v
    }()
    
    lazy var bottomView: UIView = {
        let v = UIView()
        v.backgroundColor = .white
        return v
    }()
    
    lazy var bottomTitleLabel: UILabel = {
        let v = UILabel()
        v.textColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.85)
        v.font = UIFont.systemFont(ofSize: 12)
        v.text = "支付金额："
        return v
    }()
    
    lazy var priceLabel: UILabel = {
        let v = UILabel()
        v.textColor = "177FFF".color
        v.font = UIFont.boldSystemFont(ofSize: 24)
        if (LocalTools.instance.AccountCardActive()) {
            v.text = "￥0"
        } else {
            v.text = "$0"
        }
        return v
    }()
    
    lazy var comfirmBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(UIColor.white, for: .normal)
        b.backgroundColor = "177FFF".color
        b.addTarget(self, action: #selector(self.comfirmBtnPress(_:)), for: .touchUpInside)
        b.setTitle("确认购买", for: UIControl.State())
        b.layer.cornerRadius = 22
        b.layer.masksToBounds = true
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 18)
        }
        return b
    }()
    
    @objc func rightButtonAction() {
        
        //充值记录
        let viewController = RechargeRecordViewController()
        self.navigationController?.pushViewController(viewController, animated: true)
    }
    
    @objc func comfirmBtnPress(_: UIButton) {
        let defaults = UserDefaults.standard
        let json = defaults.string(forKey: "payChannels")
        let channels = [ChannelModel].deserialize(from: json)
        
        if productSelected == nil {
            self.showTextHUD("请先选择套餐", dismissAfterDelay: 1.5)
            return
        }
        
        
        if(channels != nil && LocalTools.instance.AccountCardActive()) {
            
            let actionSheetAlert = UIAlertController(title: "请选择支付方式", message: "", preferredStyle: .actionSheet)
            
            if let popoverController = actionSheetAlert.popoverPresentationController {
                popoverController.sourceView = self.view //to set the source of your alert
                popoverController.sourceRect = CGRect(x: self.view.bounds.midX, y: self.view.bounds.midY, width: 0, height: 0) // you can set this as per your requirement.
                popoverController.permittedArrowDirections = [] //to hide the arrow of any particular direction
            }
            
            let cancelActionButton = UIAlertAction(title: "Cancel".localized(), style: .cancel) { _ in
                    print("Cancel")
                }
            actionSheetAlert.addAction(cancelActionButton)
            for channel in channels! {
                
                let channelActionBtn = UIAlertAction(title: channel?.name, style: .default) { _ in
                    let payRequestModel = PayRequestModel()
                    payRequestModel.goodsId = self.productSelected?.id ?? 0
                    payRequestModel.channel_id = channel?.channel_id
                    payRequestModel.payChannel = channel?.channel ?? ""
                    payRequestModel.method = "wap.H5"
                    
                    self.showProgreeHUD()
                    ShadowApiService.instance.GetPay(payRequestModel: payRequestModel,onSuccess: { result in
                        self.hideHUD()
                        
                        if(result.code == HttpResult.HTTP_OK ){
                            
                            let vc = FlySafariVC(url: URL(string: result.data?.payUrl ?? "")!)
                            vc.delegate = self
                            self.present(vc, animated: true, completion: nil)
                            self.orderNo = result.data?.orderNo ?? ""
                            
                        } else {
                            self.showTextHUD(result.message ?? "加载支付失败，请稍后再试", dismissAfterDelay: 2)
                        }
                        
                        
                    }, onFail: { error in
                        self.showTextHUD("加载支付失败，请稍后再试", dismissAfterDelay: 2)
                        //            print(error)
                    }, token: AppData.authUser?.token)

                }
                
                
                actionSheetAlert.addAction(channelActionBtn)
            }
            
            //支持订阅 的商品显示苹果支付
            if let productId = self.productSelected?.production_id {
                if productId.isEmpty == false && productId != "0" {
                    let applePayActionBtn = UIAlertAction(title: "ApplePay", style: .default) { _ in
                        self.startApplePay()
                    }
                    actionSheetAlert.addAction(applePayActionBtn)
                }
            }
           
            

            self.present(actionSheetAlert, animated: true) {
            }
        } else {
            startApplePay()
 
        }
        
    }
    
    func startApplePay() {
        
        if SystemUtil.isAppStore == false {
            //测试的设备不提示这个
            if SystemUtil.imei != "43486490892241fbb311b6bb68657a06" {
                self.showTextHUD("测试版app不提供内购买,如需充值,请安装app store版本,或联系在线客服", dismissAfterDelay: 2)
                return
            }
        }
        
        if SwiftyStoreKit.canMakePayments == false {
            self.showTextHUD("苹果维护中，暂无法购买", dismissAfterDelay: 1.5)
            return
        }
        //先判断是否有已经订阅成功,但是未充值的票据
        if let applePayVerifyMString = Shadow.sharedUserDefaults().string(forKey: "inPurchaseApplePayVerifyMString") {
            if let applePayVerifyM = ApplePayVerifyModel.deserialize(from: applePayVerifyMString) {
                self.showTextHUD("你上一笔订单未成功充值,正在为你充值", dismissAfterDelay: 2) {
                    self.showProgreeHUD("充值中,请稍候...")
                }
                applePayVerify(applePayVerifyM: applePayVerifyM)
                return
            }
        }
            
        
        self.showProgreeHUD("订阅中,请稍候...")

        
        let payAppleM = PayAppleModel()
        payAppleM.production_id = productSelected?.production_id ?? ""
        payAppleM.quantity = 1
        
        ShadowApiService.instance.payApple(payAppleModel: payAppleM, onSuccess: { [self] result in
            if(result.code == HttpResult.HTTP_OK ) {
                
                let orderNo = result.data?.orderNo
                
                //开始向苹果订阅
                SwiftyStoreKit.purchaseProduct(productSelected?.production_id ?? "", quantity: 1, atomically: false, applicationUsername: String(AppData.loggedUser?.id ?? 0), simulatesAskToBuyInSandbox: false) { result in
                    switch result {
                    case .success(let product):
                        if product.needsFinishTransaction {
                            SwiftyStoreKit.finishTransaction(product.transaction)
                        }
                        print("Purchase Success: \(product.productId)")
                        
                        let receiptData = SwiftyStoreKit.localReceiptData
                        let receiptString = receiptData?.base64EncodedString(options: [])
                        
                        let transactionId = product.transaction.transactionIdentifier
                        
                        let applePayVerifyM = ApplePayVerifyModel()

                        if let originalTransactionId = product.originalTransaction?.transactionIdentifier {
                            applePayVerifyM.originalTransactionId = originalTransactionId
                        } else {
                            applePayVerifyM.originalTransactionId = transactionId
                        }
                        
                        applePayVerifyM.receiptData = receiptString
                        applePayVerifyM.transactionId = transactionId
                        applePayVerifyM.orderNo = orderNo
                        

                        self.showProgreeHUD("充值中,请稍候...")
                        //购买成功,去服务器校验receipt
                        self.applePayVerify(applePayVerifyM: applePayVerifyM)
                        
                        
                        // fetch content from your server, then:
                        
                    case .error(let error):
                        
                        
                        let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
                        if iosExamine || LocalTools.instance.AccountCardActive() {
                            switch error.code {
                            case .unknown:
                                self.showTextHUD("Unknown error. Please contact support, 请联系在线客服", dismissAfterDelay: 1.5)

                            case .clientInvalid:
                                self.showTextHUD("Not allowed to make the payment, 请联系在线客服", dismissAfterDelay: 1.5)

                            case .paymentCancelled:
                                self.showTextHUD("你已取消订阅, 请联系在线客服", dismissAfterDelay: 1.5)
                                break
                            case .paymentInvalid:
                                self.showTextHUD("The purchase identifier was invalid, 请联系在线客服", dismissAfterDelay: 1.5)

                            case .paymentNotAllowed:
                                self.showTextHUD("The device is not allowed to make the payment, 请联系在线客服", dismissAfterDelay: 1.5)

                            case .storeProductNotAvailable:
                                self.showTextHUD("The product is not available in the current storefront, 请联系在线客服", dismissAfterDelay: 1.5)

                            case .cloudServicePermissionDenied:
                                self.showTextHUD("Access to cloud service information is not allowed, 请联系在线客服", dismissAfterDelay: 1.5)

                            case .cloudServiceNetworkConnectionFailed:
                                self.showTextHUD("Could not connect to the network, 请联系在线客服", dismissAfterDelay: 1.5)

                            case .cloudServiceRevoked:
                                self.showTextHUD("User has revoked permission to use this cloud service, 请联系在线客服", dismissAfterDelay: 1.5)

                            default:
                                self.showTextHUD("订阅失败,请重试, 请联系在线客服", dismissAfterDelay: 1.5)
                                print((error as NSError).localizedDescription)
                            }
                        } else {
                            switch error.code {
                            case .unknown:
                                self.showTextHUD("Unknown error. Please contact support", dismissAfterDelay: 1.5)

                            case .clientInvalid:
                                self.showTextHUD("Not allowed to make the payment", dismissAfterDelay: 1.5)

                            case .paymentCancelled:
                                self.showTextHUD("你已取消订阅", dismissAfterDelay: 1.5)
                                break
                            case .paymentInvalid:
                                self.showTextHUD("The purchase identifier was invalid", dismissAfterDelay: 1.5)

                            case .paymentNotAllowed:
                                self.showTextHUD("The device is not allowed to make the payment", dismissAfterDelay: 1.5)

                            case .storeProductNotAvailable:
                                self.showTextHUD("The product is not available in the current storefront", dismissAfterDelay: 1.5)

                            case .cloudServicePermissionDenied:
                                self.showTextHUD("Access to cloud service information is not allowed", dismissAfterDelay: 1.5)

                            case .cloudServiceNetworkConnectionFailed:
                                self.showTextHUD("Could not connect to the network", dismissAfterDelay: 1.5)

                            case .cloudServiceRevoked:
                                self.showTextHUD("User has revoked permission to use this cloud service", dismissAfterDelay: 1.5)

                            default:
                                self.showTextHUD("订阅失败,请重试", dismissAfterDelay: 1.5)
                                print((error as NSError).localizedDescription)
                            }
                        }

                    }
                }
            } else {
                self.showTextHUD(result.message ?? "下单失败,请稍候再试", dismissAfterDelay: 2)
            }

        }, onFail: { error in

            self.showTextHUD("下单失败,请稍候再试", dismissAfterDelay: 2)
        }, token: AppData.authUser?.token)

    }
    
    
    func applePayVerify(applePayVerifyM: ApplePayVerifyModel) {
        ShadowApiService.instance.applePayVerify(applePayVerifyModel: applePayVerifyM, onSuccess: { [self] result in

            if(result.code == HttpResult.HTTP_OK ){
                self.showTextHUD(result.message ?? "充值成功,请刷新时长和高速流量", dismissAfterDelay: 2)
                
                //先判断是否有失败的保存票据,充值成功后需要删除
                if let _ = Shadow.sharedUserDefaults().string(forKey: "inPurchaseApplePayVerifyMString") {
                    Shadow.sharedUserDefaults().removeObject(forKey: "inPurchaseApplePayVerifyMString")
                }

            } else {
                //receipt校验失败,需要先存起来,下次再验
                let applePayVerifyMString = applePayVerifyM.toJSONString()
                Shadow.sharedUserDefaults().set(applePayVerifyMString, forKey: "inPurchaseApplePayVerifyMString")

                self.showTextHUD(result.message ?? "充值成功，请稍后再试", dismissAfterDelay: 2)
            }

        }, onFail: { error in
            //receipt校验失败,需要先存起来,下次再验

            let applePayVerifyMString = applePayVerifyM.toJSONString()
            Shadow.sharedUserDefaults().set(applePayVerifyMString, forKey: "inPurchaseApplePayVerifyMString")
            self.showTextHUD("充值成功，请稍后再试", dismissAfterDelay: 2)
        }, token: AppData.authUser?.token)
    }
    
    func showPaySureAlert() {
        let alert = UIAlertController(title: "正在支付中...", message: "", preferredStyle: .alert)
        let notCompeletedAction = UIAlertAction(title: "未支付", style: .cancel) { _ in
            
        }
        alert.addAction(notCompeletedAction)
        let compeletedAction = UIAlertAction(title: "已支付", style: .default) { _ in
            self.paySureAction()
        }
        alert.addAction(compeletedAction)
        self.present(alert, animated: true) {
            
        }
    }
    
    func paySureAction() {
        self.showProgreeHUD()
        
        ShadowApiService.instance.CheckOrderStatus(out_trade_no: orderNo,onSuccess: {result in
            if(result.code == HttpResult.HTTP_OK){
                LocalTools.instance.mainViewController?.getUserInfo()
                
                self.showTextHUD(result.message ?? "支付成功", dismissAfterDelay: 2)
            }else {//if(result.code == HttpResult.HTTP_ERROR)
                self.showTextHUD("订单待确认，请支付成功后等待20秒点击重试，谢谢！", dismissAfterDelay: 2) {
                    self.showPaySureAlert()
                }
            }
        }, onFail: {error in
            self.showTextHUD("订单待确认，请支付成功后等待20秒点击重试，谢谢！", dismissAfterDelay: 2) {
                self.showPaySureAlert()
            }
        }, token: AppData.authUser?.token)
    }
    
    
    func getRechargeData() {
        if(AppData.authUser != nil){
            self.showProgreeHUD()
            ShadowApiService.instance.GetProducts(onSuccess: { result in
                if(result.code == HttpResult.HTTP_OK && result.data != nil){
                    AppData.products.removeAll()
                    
                    result.data?.forEach({
                        item in
                        if (LocalTools.instance.AccountCardActive()) {
                            AppData.products.append(item)
                        } else {
                            if let productId = item.production_id {
                                if productId.isEmpty == false && productId != "0" {
                                    AppData.products.append(item)
                                    self.inPurchaseProduct[item.production_id ?? ""] = ""
                                }
                            }
                        }
                    })
                    
                    if self.inPurchaseProduct.keys.count > 0 {
                        let inPurchaseProductIds = self.inPurchaseProduct.keys.reduce(into: Set<String>()) { partialResult, productId in
                            partialResult.insert(productId)
                        }
                        SwiftyStoreKit.retrieveProductsInfo(inPurchaseProductIds) { result in
                            
                            result.retrievedProducts.forEach { product in
                                
//                                let priceString = product.localizedPrice!
                                let productId = product.productIdentifier
                                self.inPurchaseProduct[productId] = product
//                                print("Product: \(product.localizedDescription), price: \(priceString)")

                            }
                            self.hideHUD()
                            self.mProducts = AppData.products

                            self.tableView.reloadData()

                        }
                    } else {
                        self.hideHUD()
                        self.mProducts = AppData.products

                        self.tableView.reloadData()
                    }
                    

                } else {
                    self.showTextHUD(result.message ?? "获取套餐失败,请重试", dismissAfterDelay: 2)

                }
            }, onFail: { error in
                self.showTextHUD("获取套餐失败,请重试", dismissAfterDelay: 2)

            }, token: AppData.authUser?.token)
            
        
        } else {
            
            if let isAutoLogining = LocalTools.instance.mainViewController?.isAutoLogining, isAutoLogining == true {
                self.showTextHUD("自动登录中,请重试", dismissAfterDelay: 2)
            } else {
                self.showTextHUD("请先登录", dismissAfterDelay: 2)
            }
        }
    }
    
    //MARK: - TableViewDelegate
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return mProducts.count
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        productSelected = mProducts[indexPath.row]
        if (LocalTools.instance.AccountCardActive()) {
            priceLabel.text = productSelected?.priceStr
        } else {
            
            if let product = inPurchaseProduct[productSelected?.production_id ?? "0"] as? SKProduct {
                priceLabel.text = product.localizedPrice
            }
        }
        tableView.reloadData()
    }
    
    //MARK: - TableViewDataSource
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        if let cell = tableView.dequeueReusableCell(withIdentifier: kRechargeCellIdentifier, for: indexPath) as? RechargeCell {
            let product = mProducts[indexPath.row]
            if let selectProduct = productSelected {
                cell.config(product: product, selectId: selectProduct.id!)
            } else {
                cell.config(product: product, selectId: -1)
            }
            
            if (LocalTools.instance.AccountCardActive()) {
                cell.showPriceLabel.isHidden = false
                
                cell.priceLabel.text = product.priceStr
                cell.showPriceLabel.text = product.showPriceStr
            } else {
                cell.showPriceLabel.isHidden = true
                if let productionId = product.production_id {
                    if productionId.isEmpty == false && self.inPurchaseProduct.keys.contains(productionId) {
                        
                        if let skProduct = inPurchaseProduct[productionId] as? SKProduct {
                            
                            cell.priceLabel.text = skProduct.localizedPrice
                            cell.nameLabel.text = skProduct.localizedTitle
                            cell.detailLabel.text = skProduct.localizedDescription
                            
                        }
                    }
                }
                
            }
            
            return cell
        }else {
            let cell = UITableViewCell()
            return cell
        }
    }
       
    @objc func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
        controller.dismiss(animated: true) {
            self.showPaySureAlert()
        }
    }
}
