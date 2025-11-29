import {FileSystem} from 'react-native-file-access';

async function writeTextFile(filePath: string, content: string) {
  await FileSystem.writeFile(filePath, content);
}

export default writeTextFile;
