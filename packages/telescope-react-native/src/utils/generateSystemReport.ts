import DeviceInfo from 'react-native-device-info';

async function generateSystemReport() {
  const result: any = {
    uniqueId: await DeviceInfo.getUniqueId(),
    instanceId: await DeviceInfo.getInstanceId(),
    serialNumber: await DeviceInfo.getSerialNumber(),
    androidId: await DeviceInfo.getAndroidId(),
    ipAddress: await DeviceInfo.getIpAddress(),
    cameraPresent: await DeviceInfo.isCameraPresent(),
    macAddress: await DeviceInfo.getMacAddress(),
    deviceId: DeviceInfo.getDeviceId(),
    manufacturer: await DeviceInfo.getManufacturer(),
    model: DeviceInfo.getModel(),
    brand: DeviceInfo.getBrand(),
    systemName: DeviceInfo.getSystemName(),
    systemVersion: DeviceInfo.getSystemVersion(),
    buildId: await DeviceInfo.getBuildId(),
    apiLevel: await DeviceInfo.getApiLevel(),
    bundleId: DeviceInfo.getBundleId(),
    installerPackageName: await DeviceInfo.getInstallerPackageName(),
    appName: DeviceInfo.getApplicationName(),
    buildNumber: DeviceInfo.getBuildNumber(),
    userAgent: await DeviceInfo.getUserAgent(),
    device: await DeviceInfo.getDevice(),
    display: await DeviceInfo.getDisplay(),
    fingerprint: await DeviceInfo.getFingerprint(),
    hardware: await DeviceInfo.getHardware(),
    host: await DeviceInfo.getHost(),
    firstInstallTime: await DeviceInfo.getFirstInstallTime(),
    installReferrer: await DeviceInfo.getInstallReferrer(),
    totalMemory: await DeviceInfo.getTotalMemory(),
    maxMemory: await DeviceInfo.getMaxMemory(),
    deviceType: DeviceInfo.getDeviceType(),
  };
  return JSON.stringify(result);
}

export default generateSystemReport;
