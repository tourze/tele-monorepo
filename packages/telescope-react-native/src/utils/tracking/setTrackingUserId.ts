import NewRelic from 'newrelic-react-native-agent';

async function setTrackingUserId(id: string) {
  console.log('set tracking user id', id);
  NewRelic.setUserId(id);
}

export default setTrackingUserId;
