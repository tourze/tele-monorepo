
//
//  DateUtil.swift

//
//  Created by  on 2019/10/3.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation

class DateUtil: NSObject {
    /// 日期字符串转化为Date类型
    ///
    /// - Parameters:
    ///   - string: 日期字符串
    ///   - dateFormat: 格式化样式，默认为“yyyy-MM-dd HH:mm:ss”
    /// - Returns: Date类型
    static func stringConvertDate(string:String, dateFormat:String="yyyy-MM-dd HH:mm:ss") -> Date {
       
        let dateFormatter = DateFormatter.init()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        let date = dateFormatter.date(from: string)
        return date ?? Date()
    }
    
    
    /// Date类型转化为日期字符串
    ///
    /// - Parameters:
    ///   - date: Date类型
    ///   - dateFormat: 格式化样式默认“yyyy-MM-dd”
    /// - Returns: 日期字符串
    static func dateConvertString(date:Date, dateFormat:String="yyyy-MM-dd HH:mm:ss") -> String {
        let dateF = DateFormatter()
        // aaa 用于显示上午还是下午，mm和MM 分别表示12小时制和24小时制
        dateF.dateFormat = dateFormat
        let str = dateF.string(from: date)
        return str
    }
    
    static func dateStringToAmPm(date:Date)->String{
        let dateF = DateFormatter()
        // aaa 用于显示上午还是下午，mm和MM 分别表示12小时制和24小时制
        dateF.dateFormat = "hh:mm aaa"
        dateF.amSymbol = "AM"
        dateF.pmSymbol = "PM"
        let str = dateF.string(from: date)
        return str
    }
    
    static func GetTimeStringFromMinute(minute:Int) -> String
    {
         
        if (minute < 0)
        {
            return "";
        }
        var time: String  = "";
        let day:Int = (minute / 60) / 24;
        let hour:Int = (minute / 60) % 24;
        let min:Int = minute % 60;
            if (day > 0)
            {
                time += "\(day) 天"
            }
            if (hour > 0)
            {
                time += "\(hour) 小时"
            }
            if (min >= 0)
            {
                time += "\(min) 分钟"
            }
            return time;
        }

}
