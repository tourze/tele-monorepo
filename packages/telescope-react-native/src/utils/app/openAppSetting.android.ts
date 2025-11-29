import AndroidOpenSettings from 'react-native-android-open-settings';

async function openAppSetting() {
  AndroidOpenSettings.appDetailsSettings();
}

export default openAppSetting;
