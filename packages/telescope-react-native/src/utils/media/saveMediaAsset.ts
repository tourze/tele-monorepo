import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {SaveToCameraRollOptions} from '@react-native-camera-roll/camera-roll';

async function saveMediaAsset(
  tag: string,
  options: SaveToCameraRollOptions = {},
) {
  await CameraRoll.saveAsset(tag, options);
}

export default saveMediaAsset;
