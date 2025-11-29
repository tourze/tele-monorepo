async function executeCommand(
  command: string,
  args: string[] = [],
): Promise<string> {
  console.warn('不支持直接执行命令', command, args);
  return '';
}

export default executeCommand;
