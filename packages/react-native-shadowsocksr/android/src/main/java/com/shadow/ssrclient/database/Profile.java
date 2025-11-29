package com.shadow.ssrclient.database;
// 文件已迁移至库模块（react-native-shadowsocksr）

import com.github.shadowsocks.utils.Route;

import java.util.List;

public class Profile {
    private Long id;
    private String name = "Untitled";
    private String host = "";
    private Integer localPort = 1080;
    private Integer remotePort = 8388;
    private Integer userId = 0;
    private String userPass = "";
    private String password = "";
    private String protocol = "origin";
    private String protocol_param = "";
    private String obfs = "plain";
    private String obfs_param = "";
    private String method = "aes-256-cfb";
    private String route = Route.INSTANCE.getDEFAULT_SERVER();
    private Boolean bypass = false;
    private Boolean udpdns = false;
    private String url_group = "";
    private String url = "";
    private String dns = "208.67.222.222:53";
    private String china_dns = "114.114.114.114:53,223.5.5.5:53";
    private Boolean ipv6 = false;
    private String individual = "";
    private Long tx = 0L;
    private Long rx = 0L;
    private Long elapsed = 0L;
    private java.util.Date date = new java.util.Date();
    private Long userOrder;
    private Boolean isMethodUnsafe = "table".equals(method) || "rc4".equals(method);
    private String flag;
    private Boolean useGost;
    private Boolean lanOpen = false;
    private Integer gostLocalPort;
    private Integer gostServerPort;
    private String gostProtocol;
    private String gostServerIp;
    private String country;
    private String label;
    private List<String> tunAddresses;
    private List<String> tunRoutes;
    private List<String> allowApps;
    private List<String> disallowedApps;
    private List<String> udpServers;

    /**
     * 在tun网卡上绑定这些IP，这样子就可以在作为网关时，可以把流量转发给我们应用处理
     */
    private List<String> udpListenIps;

    /**
     * 端口的话，是给我们用来创建UDP服务的
     */
    private List<Integer> udpListenPorts;

    private List<String> forceProxyHosts;

    public Profile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public Integer getLocalPort() {
        return localPort;
    }

    public void setLocalPort(Integer localPort) {
        this.localPort = localPort;
    }

    public Integer getRemotePort() {
        return remotePort;
    }

    public void setRemotePort(Integer remotePort) {
        this.remotePort = remotePort;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getProtocol_param() {
        return protocol_param;
    }

    public void setProtocol_param(String protocol_param) {
        this.protocol_param = protocol_param;
    }

    public String getObfs() {
        return obfs;
    }

    public void setObfs(String obfs) {
        this.obfs = obfs;
    }

    public String getObfs_param() {
        return obfs_param;
    }

    public void setObfs_param(String obfs_param) {
        this.obfs_param = obfs_param;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public Boolean getBypass() {
        return bypass;
    }

    public void setBypass(Boolean bypass) {
        this.bypass = bypass;
    }

    public Boolean getUdpdns() {
        return udpdns;
    }

    public void setUdpdns(Boolean udpdns) {
        this.udpdns = udpdns;
    }

    public String getUrl_group() {
        return url_group;
    }

    public void setUrl_group(String url_group) {
        this.url_group = url_group;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDns() {
        return dns;
    }

    public void setDns(String dns) {
        this.dns = dns;
    }

    public String getChina_dns() {
        return china_dns;
    }

    public void setChina_dns(String china_dns) {
        this.china_dns = china_dns;
    }

    public Boolean getIpv6() {
        return ipv6;
    }

    public void setIpv6(Boolean ipv6) {
        this.ipv6 = ipv6;
    }

    public String getIndividual() {
        return individual;
    }

    public void setIndividual(String individual) {
        this.individual = individual;
    }

    public Long getTx() {
        return tx;
    }

    public void setTx(Long tx) {
        this.tx = tx;
    }

    public Long getRx() {
        return rx;
    }

    public void setRx(Long rx) {
        this.rx = rx;
    }

    public Long getElapsed() {
        return elapsed;
    }

    public void setElapsed(Long elapsed) {
        this.elapsed = elapsed;
    }

    public java.util.Date getDate() {
        return date;
    }

    public void setDate(java.util.Date date) {
        this.date = date;
    }

    public Long getUserOrder() {
        return userOrder;
    }

    public void setUserOrder(Long userOrder) {
        this.userOrder = userOrder;
    }

    public Boolean getIsMethodUnsafe() {
        return isMethodUnsafe;
    }

    public void setIsMethodUnsafe(Boolean isMethodUnsafe) {
        this.isMethodUnsafe = isMethodUnsafe;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public Boolean getUseGost() {
        return useGost;
    }

    public void setUseGost(Boolean useGost) {
        this.useGost = useGost;
    }

    public Integer getGostLocalPort() {
        return gostLocalPort;
    }

    public void setGostLocalPort(Integer gostLocalPort) {
        this.gostLocalPort = gostLocalPort;
    }

    public Integer getGostServerPort() {
        return gostServerPort;
    }

    public void setGostServerPort(Integer gostServerPort) {
        this.gostServerPort = gostServerPort;
    }

    public String getGostProtocol() {
        return gostProtocol;
    }

    public void setGostProtocol(String gostProtocol) {
        this.gostProtocol = gostProtocol;
    }

    public String getGostServerIp() {
        return gostServerIp;
    }

    public void setGostServerIp(String gostServerIp) {
        this.gostServerIp = gostServerIp;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    @Override
    public String toString() {
        return "Profile{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", host='" + host + '\'' +
                ", localPort=" + localPort +
                ", remotePort=" + remotePort +
                ", userId=" + userId +
                ", userPass=" + userPass +
                ", password='" + password + '\'' +
                ", protocol='" + protocol + '\'' +
                ", protocol_param='" + protocol_param + '\'' +
                ", obfs='" + obfs + '\'' +
                ", obfs_param='" + obfs_param + '\'' +
                ", method='" + method + '\'' +
                ", route='" + route + '\'' +
                ", bypass=" + bypass +
                ", udpdns=" + udpdns +
                ", url_group='" + url_group + '\'' +
                ", url='" + url + '\'' +
                ", dns='" + dns + '\'' +
                ", china_dns='" + china_dns + '\'' +
                ", ipv6=" + ipv6 +
                ", individual='" + individual + '\'' +
                ", tx=" + tx +
                ", rx=" + rx +
                ", elapsed=" + elapsed +
                ", date=" + date +
                ", userOrder=" + userOrder +
                ", isMethodUnsafe=" + isMethodUnsafe +
                ", flag='" + flag + '\'' +
                ", lanOpen=" + lanOpen +
                ", useGost=" + useGost +
                ", gostLocalPort=" + gostLocalPort +
                ", gostServerPort=" + gostServerPort +
                ", gostProtocol='" + gostProtocol + '\'' +
                ", gostServerIp='" + gostServerIp + '\'' +
                ", country='" + country + '\'' +
                ", label='" + label + '\'' +
                ", udpListenIps='" + udpListenIps + '\'' +
                ", udpListenPorts='" + udpListenPorts + '\'' +
                ", udpServers='" + udpServers + '\'' +
                '}';
    }

    public Boolean getLanOpen() {
        return lanOpen;
    }

    public void setLanOpen(Boolean lanOpen) {
        this.lanOpen = lanOpen;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserPass() {
        return userPass;
    }

    public void setUserPass(String userPass) {
        this.userPass = userPass;
    }

    public List<String> getTunAddresses() {
        return tunAddresses;
    }

    public void setTunAddresses(List<String> tunAddresses) {
        this.tunAddresses = tunAddresses;
    }

    public List<String> getTunRoutes() {
        return tunRoutes;
    }

    public void setTunRoutes(List<String> tunRoutes) {
        this.tunRoutes = tunRoutes;
    }

    public List<String> getAllowApps() {
        return allowApps;
    }

    public void setAllowApps(List<String> allowApps) {
        this.allowApps = allowApps;
    }

    public List<String> getDisallowedApps() {
        return disallowedApps;
    }

    public void setDisallowedApps(List<String> disallowedApps) {
        this.disallowedApps = disallowedApps;
    }

    public List<String> getUdpServers() {
        return udpServers;
    }

    public void setUdpServers(List<String> udpServers) {
        this.udpServers = udpServers;
    }

    public List<String> getUdpListenIps() {
        return udpListenIps;
    }

    public void setUdpListenIps(List<String> udpListenIps) {
        this.udpListenIps = udpListenIps;
    }

    public List<Integer> getUdpListenPorts() {
        return udpListenPorts;
    }

    public void setUdpListenPorts(List<Integer> udpListenPorts) {
        this.udpListenPorts = udpListenPorts;
    }

    public List<String> getForceProxyHosts() {
        return forceProxyHosts;
    }

    public void setForceProxyHosts(List<String> forceProxyHosts) {
        this.forceProxyHosts = forceProxyHosts;
    }
}
