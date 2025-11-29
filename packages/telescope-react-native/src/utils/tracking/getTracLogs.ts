import Tracking from './Tracking';

async function getTracLogs() {
  return JSON.stringify(Tracking.getAll());
}

export default getTracLogs;
