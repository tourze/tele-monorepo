function isPhoneNumber(mobile: string) {
  return /^1\d{10}$/.test(mobile);
}

export default isPhoneNumber;
