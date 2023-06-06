import { WorkerConfig } from './interface';
import { startFileMonitorWorker } from './util';

const defaultConfig: Required<WorkerConfig> = {
  loopMs: 5000,
  enable: true,
  checkFileUrl: `${location.origin}/index.html`,
  notification: {
    title: 'Page has Update!',
    options: {
      dir: 'auto',
      body: 'Find upgrades, click me to update',
      requireInteraction: true,
    },
  },
  clickCallback: () => {
    window.location.reload();
  },
};

export function remoteFileMonitor(config: WorkerConfig = {}) {
  const dataItem: Required<WorkerConfig> = {
    ...defaultConfig,
    ...config,
    notification: {
      ...defaultConfig.notification,
      ...config.notification,
    },
  };
  if (dataItem.enable) {
    if (window.Worker) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          startFileMonitorWorker(dataItem);
        }
      });
    } else {
      console.log(`Your browser doesn't support web workers.`);
    }
  }
}
