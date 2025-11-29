//
//  LogDetailViewController.swift
//  StarFast
//
//  Created by LEI on 4/21/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import Foundation
import SnapKit
import ShadowBase
import ShadowLibrary

class LogDetailVC: UIViewController {
    
    var source: DispatchSource?
    var fd: Int32 = 0
    var data = NSMutableData()
    
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        navigationItem.title = "Logs".localized()
        showLog()

        
//        Manager.sharedManager.wormhole.listenForMessage(withIdentifier: "tunnelConnectionRecords") { (response) in
//            debugPrint("~~~~~~~~~~~")
//            debugPrint(response as! String)
//            debugPrint("~~~~~~~~~~~")
//
//            return
//        }
//
//
//        Manager.sharedManager.wormhole.passMessageObject("" as NSCoding?, identifier: "getTunnelConnectionRecords")

    }
    
    deinit {
        if let source = source {
            source.cancel()
        }
    }
    
    func showLog() {
        guard LoggingLevel.currentLoggingLevel != .off else {
            emptyView.isHidden = false
            return
        }
        fd = Darwin.open(Shadow.sharedLogUrl().path, O_RDONLY)
        guard fd > 0 else {
            return
        }
        let queue = DispatchQueue.global(qos: DispatchQoS.QoSClass.default)
        source = DispatchSource.makeReadSource(fileDescriptor: fd, queue: queue) /*Migrator FIXME: Use DispatchSourceRead to avoid the cast*/ as? DispatchSource
        guard let source = source else {
            return
        }
        source.setEventHandler{ [weak self] in
            self?.printTunnelLog()
        }
        source.setCancelHandler {
            let fd = (source as DispatchSourceProtocol).handle;
            _ = Darwin.close(Int32(fd));
        }
        source.resume();
    }
    
    func printTunnelLog() {
        guard let source = source else {
            return
        }
        let pending = (source as DispatchSourceProtocol).data
        let size = Int(min(pending, 65535))
        let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: size)
        defer {
            buffer.deallocate()
        }
        let readSize = Darwin.read(fd, buffer, size)
        data.append(buffer, length: readSize)
        if let content = String(data: data as Data, encoding: String.Encoding.utf8) {
            print("TunnelLog: \(content)")
            
            DispatchQueue.main.async(execute: {
                self.logView.text = self.logView.text + content
            })
            data = NSMutableData()
        }
    }
    
    override func loadView() {
        super.loadView()
        view.backgroundColor = Color.Background
        view.addSubview(logView)
        view.addSubview(emptyView)
        
        logView.snp.makeConstraints { (make) in
            make.edges.equalToSuperview()
        }
        emptyView.snp.makeConstraints { (make) in
            make.edges.equalToSuperview()
        }

    }
    
    lazy var logView: UITextView = {
        let v = UITextView()
        v.isEditable = false
        v.backgroundColor = Color.Background
        return v
    }()
    
    lazy var emptyView: BaseEmptyView = {
        let v = BaseEmptyView()
        v.title = "Logging is disabled".localized()
        v.isHidden = true
        return v
    }()
    
}
