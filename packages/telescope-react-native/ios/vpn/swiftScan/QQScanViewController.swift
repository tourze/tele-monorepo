//
//  QQScanViewController.swift
//  swiftScan
//
//  Created by xialibing on 15/12/10.
//  Copyright © 2015年 xialibing. All rights reserved.
//

import Foundation
import AVFoundation


class QQScanViewController: LBXScanViewController {

    /**
    @brief  扫码区域上方提示文字
    */
    var topTitle: UILabel?

    /**
     @brief  闪关灯开启状态
     */
    var isOpenedFlash: Bool = false

// MARK: - 底部几个功能：开启闪光灯、相册、我的二维码

    //底部显示的功能项
    var bottomItemsView: UIView?

    //相册
    var btnPhoto: UIButton = UIButton()

    //闪光灯
    var btnFlash: UIButton = UIButton()


    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    

    override func viewDidLoad() {
        super.viewDidLoad()

        arrayCodeType = [AVMetadataObject.ObjectType.qr as NSString] as [AVMetadataObject.ObjectType]
        
        //需要识别后的图像
        setNeedCodeImage(needCodeImg: true)
        
        setOpenInterestRect(isOpen: true)

        //框向上移动10个像素
        scanStyle?.centerUpOffset += 10
        
        topTitle = UILabel()
        let size = CGSize(width: self.view.frame.width, height: 30)
        topTitle?.bounds = CGRect(x: 0, y: 0, width: size.width, height: size.height)
        topTitle?.center = CGPoint(x: self.view.frame.width/2, y:20)
        
        topTitle?.text = "仅支持ssr://"
//        topTitle?.backgroundColor = .white
        topTitle?.textColor = Color.DefualtColor
        topTitle?.textAlignment = .center
        
        self.view.addSubview(topTitle!)
        // Do any additional setup after loading the view.
    }

    override func viewDidAppear(_ animated: Bool) {

        super.viewDidAppear(animated)

        drawBottomItems()
    }
    
//    func getUserInfo(){
//
//        ShadowApiService.instance.GetUserInfo(onSuccess: {
//            result in
//            if result.code == HttpResult.HTTP_OK{
//                if result.data != nil{
//                    LocalTools.instance.updateAuthUser(authUser: AppData.authUser!,user: result.data)
//
//                }
//
//            }
//        }, token: AppData.authUser?.token)
//    }

    override func handleCodeResult(arrayResult: [LBXScanResult]) {
        
        for result: LBXScanResult in arrayResult {
            if let str = result.strScanned {
                print(str)
                
                if(str.starts(with: "ssr://")){
                    
                    let profielDict = ParseAppURLSchemes(URL(string:str))
                    if profielDict != nil{
                        let server = ProfileServer.fromDictionary(profielDict! as [String:AnyObject])
                        
                        var normalListArray : Array<ProfileServer> = []
                        let normalServers = LocalTools.instance.getNormalNodeFromLocal()
                        if normalServers.count > 0{
                            for item in normalServers {
                                if item != nil{
                                    normalListArray.append(item!)
                                }
                                
                            }
                        }
                        normalListArray.append(server)
                        let json = normalListArray.toJSONString();
                        LocalTools.instance.setValueForKey(key: "normalServerNodes", value: json)
                        
                        self.showTextHUD("添加节点成功", dismissAfterDelay: 1.5)
                        
                        DispatchQueue.global().async {
                            sleep(2)
                            DispatchQueue.main.async {
                                self.navigationController?.popToRootViewController(animated: true)
                            }
                            
                        }
                        
                    }
                    
                    
                }else if(str.contains("card_number")&&str.contains("card_password")){
                    
                    if let res = CouponRequestModel.deserialize(from: str) {                        
                        let cardAndPasswd = "\(res.card_number)#\(res.card_password)#\(res.channel)"
                        LocalTools.instance.mainViewController?.activityByCardPassword(cardAndPasswd: cardAndPasswd)
                        self.navigationController?.popViewController(animated: true)

                    }else{
                        sleep(1)
                        self.showTextHUD("不支持的二维码值", dismissAfterDelay: 2) {
                            self.navigationController?.popViewController(animated: true)
                        }
                    }
                    
                } else {
                    print("no surpport code")
                    sleep(1)
                    self.showTextHUD("不支持的二维码值", dismissAfterDelay: 2) {
                        self.navigationController?.popViewController(animated: true)
                    }
                }
            }
        }
        
        //  let result: LBXScanResult = arrayResult[0]
        
        
    }

    func drawBottomItems() {
        if (bottomItemsView != nil) {

            return
        }

        let yMax = self.view.frame.maxY - self.view.frame.minY

        bottomItemsView = UIView(frame: CGRect(x: 0.0, y: yMax-100, width: self.view.frame.size.width, height: 100 ) )

        bottomItemsView!.backgroundColor = UIColor(red: 0.0, green: 0.0, blue: 0.0, alpha: 0.6)

        self.view.addSubview(bottomItemsView!)

        let size = CGSize(width: 65, height: 87)

        self.btnFlash = UIButton()
        btnFlash.bounds = CGRect(x: 0, y: 0, width: size.width, height: size.height)
        btnFlash.center = CGPoint(x: bottomItemsView!.frame.width*3/4, y: bottomItemsView!.frame.height/2)

        btnFlash.setImage(UIImage(named: "CodeScan.bundle/qrcode_scan_btn_flash_nor"), for:UIControl.State.normal)
        btnFlash.addTarget(self, action: #selector(QQScanViewController.openOrCloseFlash), for: UIControl.Event.touchUpInside)
        

        self.btnPhoto = UIButton()
        btnPhoto.bounds = btnFlash.bounds
        btnPhoto.center = CGPoint(x: bottomItemsView!.frame.width/4, y: bottomItemsView!.frame.height/2)
        btnPhoto.setImage(UIImage(named: "CodeScan.bundle/qrcode_scan_btn_photo_nor"), for: UIControl.State.normal)
        btnPhoto.setImage(UIImage(named: "CodeScan.bundle/qrcode_scan_btn_photo_down"), for: UIControl.State.highlighted)
//        btnPhoto.addTarget(self, action: Selector(("openPhotoAlbum")), for: UIControlEvents.touchUpInside)

        btnPhoto.addTarget(self, action: #selector(openPhotoAlbum), for: UIControl.Event.touchUpInside)
        
      

        bottomItemsView?.addSubview(btnFlash)
        bottomItemsView?.addSubview(btnPhoto)
     

        view.addSubview(bottomItemsView!)
    }
    
    //开关闪光灯
    @objc func openOrCloseFlash() {
        scanObj?.changeTorch()

        isOpenedFlash = !isOpenedFlash
        
        if isOpenedFlash
        {
            btnFlash.setImage(UIImage(named: "CodeScan.bundle/qrcode_scan_btn_flash_down"), for:UIControl.State.normal)
        }
        else
        {
            btnFlash.setImage(UIImage(named: "CodeScan.bundle/qrcode_scan_btn_flash_nor"), for:UIControl.State.normal)

        }
    }



}
