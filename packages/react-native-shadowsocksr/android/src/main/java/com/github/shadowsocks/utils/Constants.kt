package com.github.shadowsocks.utils
// 文件已迁移至库模块（react-native-shadowsocksr）

object Executable {
    val PDNSD = "pdnsd"
    val SS_LOCAL = "ss-local"
    val SS_TUNNEL = "ss-tunnel"
    val TUN2SOCKS = "tun2socks"
    val KCPTUN = "kcptun"
}

object ConfigUtils {

    fun EscapedJson(OriginString: String): String {
        val ProcessString = OriginString.replace("\\\\", "\\\\\\\\").replace("\"", "\\\\\"")
        return ProcessString
    }

    val SHADOWSOCKS =
        "{" +
                "\"server\": \"%s\"," +
                " \"server_port\": %d," +
                " \"local_port\": %d," +
                " \"password\": \"%s\"," +
                " \"user_id\": %d," +
                " \"user_pass\": \"%s\"," +
                " \"method\":\"%s\"," +
                " \"timeout\": %d," +
                " \"protocol\": \"%s\"," +
                " \"obfs\": \"%s\"," +
                " \"obfs_param\": \"%s\"," +
                " \"protocol_param\": \"%s\"}"

    val PDNSD_LOCAL =
        """
      |global {
      | perm_cache = 2048;
      | %s
      | cache_dir = "%s";
      | server_ip = %s;
      | server_port = %d;
      | query_method = tcp_only;
      | min_ttl = 15m;
      | max_ttl = 1w;
      | timeout = 10;
      | daemon = off;
      |}
      |
      |server {
      | label = "local";
      | ip = 127.0.0.1;
      | port = %d;
      | reject = %s;
      | reject_policy = negate;
      | reject_recursively = on;
      |}
      |
      |rr {
      | name=localhost;
      | reverse=on;
      | a=127.0.0.1;
      | owner=localhost;
      | soa=localhost,root.localhost,42,86400,900,86400,86400;
      |}
    """.trimMargin()

    val PDNSD_DIRECT =
        """
      |global {
      | perm_cache = 2048;
      | %s
      | cache_dir = "%s";
      | server_ip = %s;
      | server_port = %d;
      | query_method = udp_only;
      | min_ttl = 15m;
      | max_ttl = 1w;
      | timeout = 10;
      | daemon = off;
      | par_queries = 4;
      |}
      |
      |%s
      |
      |server {
      | label = "local-server";
      | ip = 127.0.0.1;
      | query_method = tcp_only;
      | port = %d;
      | reject = %s;
      | reject_policy = negate;
      | reject_recursively = on;
      |}
      |
      |rr {
      | name=localhost;
      | reverse=on;
      | a=127.0.0.1;
      | owner=localhost;
      | soa=localhost,root.localhost,42,86400,900,86400,86400;
      |}
    """.trimMargin()

    val REMOTE_SERVER =
        """
        |server {
        | label = "remote-servers";
        | ip = %s;
        | port = %d;
        | timeout = 3;
        | query_method = udp_only;
        | %s
        | policy = included;
        | reject = %s;
        | reject_policy = fail;
        | reject_recursively = on;
        |}
      """.trimMargin()
}

object Key {
    val id = "profileId"
    val name = "profileName"

    val host = "proxy"
    val dns = "dns"
    val currentVersionCode = "currentVersionCode"
}

object State {
    val CONNECTING = 1
    val CONNECTED = 2
    val STOPPING = 3
    val STOPPED = 4
    fun isAvailable(state: Int): Boolean = state != CONNECTED && state != CONNECTING
}

object Action {
    val SERVICE = "in.zhaoj.shadowsocksrr.SERVICE"
    val CLOSE = "in.zhaoj.shadowsocksrr.CLOSE"
}

object Route {
    val ALL = "all"
    val BYPASS_LAN = "bypass-lan"
    val BYPASS_CHN = "bypass-china"
    val BYPASS_LAN_CHN = "bypass-lan-china"
    val GFWLIST = "gfwlist"
    val CHINALIST = "china-list"
    val DEFAULT_SERVER = "default-server"
    val ACL = "self"
}
