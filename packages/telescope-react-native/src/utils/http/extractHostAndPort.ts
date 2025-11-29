function extractHostAndPort(url: string) {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname;
    let port = parsedUrl.port;

    // 如果 URL 中未指定端口，则根据协议设置默认端口
    if (!port) {
      port = parsedUrl.protocol === 'https:' ? '443' : '80';
    }

    return {
      host: host,
      port: port
    };
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

export default extractHostAndPort;
