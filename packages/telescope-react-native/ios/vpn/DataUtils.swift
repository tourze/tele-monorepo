//
//  DataUtils.swift
//  ShadowsocksX-NG
//
//  Created by  on 2019/4/21.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation

import CryptoSwift



extension String {
    
    
    
    func aesEncrypt(key: String = HttpConfig.sKey, iv: String = HttpConfig.ivParameter) -> String?{
        
        // do-catch进行异常抛出
        var result:String? = nil
        do {
            let data = self.data(using: String.Encoding.utf8)
            // 出初始化AES
            let aes = try AES(key: [UInt8](key.data(using: String.Encoding.utf8)!), blockMode: CBC(iv: [UInt8](iv.data(using: String.Encoding.utf8)!)), padding: .pkcs7)
            // 进行AES加密
            result = try aes.encrypt([UInt8](data!)).toBase64()
        } catch {
            return nil
        }
        return result
    }
    
    
    var isPhoneNum:Bool{
        let predicateStr = "\\d{11}"
        let predicate =  NSPredicate(format: "SELF MATCHES %@" ,predicateStr)
        return predicate.evaluate(with: self)
    }
    
    var isEmail:Bool{
        let predicateStr = "^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,20})$"
        let predicate =  NSPredicate(format: "SELF MATCHES %@" ,predicateStr)
        return predicate.evaluate(with: self)
    }
    
//    func aesDecrypt(key: String, iv: String) throws -> String {
//        let data = NSData(base64Encoded: self, options: NSData.Base64DecodingOptions(rawValue: 0))
//        let dec = try AES(key: key, iv: iv, blockMode:.CBC).decrypt(data!.arrayOfBytes(), padding: PKCS7())
//        let decData = NSData(bytes: dec, length: Int(dec.count))
//        let result = NSString(data: decData, encoding: NSUTF8StringEncoding)
//        return String(result!)
//    }
    func isTelNumber()->Bool

    {
        let mobile = "^1(\\d{10}$)"
//        let mobile = "^1((3[0-9]|4[57]|5[0-35-9]|7[0678]|8[0-9])\\d{8}$)"
//
//        let  CM = "(^1(3[4-9]|4[7]|5[0-27-9]|7[8]|8[2-478])\\d{8}$)|(^1705\\d{7}$)";
//
//        let  CU = "(^1(3[0-2]|4[5]|5[56]|7[6]|8[56])\\d{8}$)|(^1709\\d{7}$)";
//
//        let  CT = "(^1(33|53|77|8[019])\\d{8}$)|(^1700\\d{7}$)";

        let regextestmobile = NSPredicate(format: "SELF MATCHES %@",mobile)

//        let regextestcm = NSPredicate(format: "SELF MATCHES %@",CM )
//
//        let regextestcu = NSPredicate(format: "SELF MATCHES %@" ,CU)
//
//        let regextestct = NSPredicate(format: "SELF MATCHES %@" ,CT)

        if ((regextestmobile.evaluate(with: self) == true)

//            || (regextestcm.evaluate(with: self)  == true)
//
//            || (regextestct.evaluate(with: self) == true)
//
//            || (regextestcu.evaluate(with: self) == true)
            )

        {

            return true

        }

        else

        {

            return false

        }

    }
  

}
