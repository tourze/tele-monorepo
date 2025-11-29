import { noop } from 'lodash';

function convertMinutesToReadableFormat(
  minutes: number,
  t: Function = noop,
): string {
  if (minutes <= 0) {
    return t('Page_UserCenter_Expired');
  }

  const days = Math.floor(minutes / 1440); // 一天有1440分钟
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;

  let result = '';
  if (days > 0) {
    result += `${days}${t('Day')}`;
  }
  if (hours > 0) {
    result += `${hours}${t('Hour')}`;
  }
  if (remainingMinutes > 0) {
    result += `${remainingMinutes}${t('Minute')}`;
  }

  return result;
}

export default convertMinutesToReadableFormat;
