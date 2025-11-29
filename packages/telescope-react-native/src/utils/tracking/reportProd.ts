import NewRelic from 'newrelic-react-native-agent';
import formatData from './formatData';

/**
 * 上报到NewRelic
 *
 * @param name
 * @param params
 */
async function reportProd(name: string, params: any = {}) {
  NewRelic.logInfo(`${name} - ${JSON.stringify(formatData(params))}`);
}

export default reportProd;
