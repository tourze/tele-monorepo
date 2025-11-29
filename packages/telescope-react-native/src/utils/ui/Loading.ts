import {set} from '../../hooks/useStorage';

const DEFAULT_TEXT = '加载中';

class Loading {
  static async show(text: string = DEFAULT_TEXT) {
    await set('loadingText', text);
    await set('loadingShow', true);
  }

  static async hide() {
    await set('loadingShow', false);
    await set('loadingText', DEFAULT_TEXT);
  }
}

export default Loading;
