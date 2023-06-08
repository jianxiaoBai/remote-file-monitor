import { WorkerConfig } from './interface';

export const handleVisibilityChange = (worker: Worker) => {
  if (document.visibilityState === 'hidden') {
    worker.postMessage({
      status: 'pause',
    });
  } else {
    worker.postMessage({
      status: 'start',
    });
  }
};

export const startFileMonitorWorker = (config: Required<WorkerConfig>) => {
  const worker: Worker = createWorker(createWorkerFunc);
  worker.onmessage = event => {
    const { hasUpdate } = event.data;
    if (hasUpdate) {
      notifyToUser(
        config.notification.title,
        config.notification.options,
        config.clickCallback
      );
      console.log('The page has updated');
    }
  };
  worker.postMessage({
    checkFileUrl: config.checkFileUrl,
    loopMs: config.loopMs,
  });

  document.addEventListener('visibilitychange', () => {
    handleVisibilityChange(worker);
  });
};

export const createWorker = (func: () => void) => {
  const blob = new Blob(['(' + func.toString() + ')()']);
  const url = window.URL.createObjectURL(blob);
  const worker = new Worker(url);
  window.URL.revokeObjectURL(url);
  return worker;
};

export const createWorkerFunc = () => {
  let previousValue: string | null = null;
  let timer: NodeJS.Timer | null = null;
  const ctx: Worker = self as any;
  let options: any = {};

  ctx.onmessage = function(event: any) {
    options = Object.assign({}, options, event.data);
    const { checkFileUrl, loopMs, status } = options;
    const fetchFunc = () => {
      fetch(checkFileUrl, { method: 'HEAD' })
        .then(response => response.headers.get('ETag'))
        .then(changeFlag => {
          if (!changeFlag) {
            console.log(`Can't get the change flag`);
            if (timer) {
              clearInterval(timer);
            }
            return;
          }
          if (previousValue === null) {
            previousValue = changeFlag;
          } else if (previousValue !== changeFlag) {
            previousValue = changeFlag;
            ctx.postMessage({
              hasUpdate: true,
            });
          }
        })
        .catch(error => {
          console.error(error);
          if (timer) {
            clearInterval(timer);
          }
        });
    };
    if (status === 'pause') {
      if (timer) {
        clearInterval(timer);
      }
      return;
    }
    timer = setInterval(fetchFunc, loopMs);
  };
  return ctx;
};

const notifyToUser = (
  title: string,
  options: NotificationOptions,
  callback: () => void
) => {
  if (window.Notification) {
    try {
      if (Notification.permission === 'granted') {
        notifyAction(title, options, callback);
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            notifyAction(title, options, callback);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const notifyAction = (
  title: string,
  options: NotificationOptions,
  callback: () => void
) => {
  return new Promise<void>(resolve => {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      notification.close();
      callback();
    };
    resolve();
  });
};
