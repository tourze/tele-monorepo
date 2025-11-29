function fixPath(path: string): string {
  const prefix = '\\\\?\\';
  if (path.startsWith(prefix)) {
    path = path.substring(prefix.length);
  }
  return path;
}

export default fixPath;
