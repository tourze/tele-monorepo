import {open} from '@tauri-apps/plugin-dialog';

async function selectSingleImage__forTauri() {
  const uri = await open({
    multiple: false,
    filters: [
      {
        name: 'Image',
        extensions: ['png', 'jpeg', 'jpg'],
      },
    ],
  });
  // "/Users/user1/Downloads/AccountCard-510009.jpg"
  console.log('uri', uri);
  return uri;
}

export default selectSingleImage__forTauri;
