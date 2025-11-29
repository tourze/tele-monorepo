async function spawn(
  str: string,
  args: string[],
  options: any = {},
): Promise<number> {
  console.warn('shell->spawn未实现', str, args, options);
  return 0;
}

export default spawn;
