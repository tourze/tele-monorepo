function stringToHex(str: string): string {
  let hex = '';
  for(let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i).toString(16);
    hex += code.padStart(2, '0');
  }
  return hex;
}

export default stringToHex;
