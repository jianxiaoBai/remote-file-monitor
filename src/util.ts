import { WorkerConfig } from './interface';

export const startFileMonitorWorker = (config: Required<WorkerConfig>) => {
  const worker = createWorker(createWorkerFunc);
  worker.onmessage = event => {
    const { hasUpdate } = event.data;
    if (hasUpdate) {
      notifyToUser(
        config.notification.title,
        config.notification.options,
        config.clickCallback
      );
    }
  };
  worker.postMessage({
    checkFileUrl: config.checkFileUrl,
    loopMs: config.loopMs,
  });
};

export const createWorker = (func: () => void) => {
  const blob = new Blob(['(' + func.toString() + ')()']);
  const url = window.URL.createObjectURL(blob);
  const worker = new Worker(url);
  return worker;
};

export const createWorkerFunc = () => {
  let previousValue: string | null = null;
  const ctx: Worker = self as any;
  ctx.onmessage = function(event: any) {
    const { checkFileUrl, loopMs } = event.data;
    const clearTimer = setInterval(() => {
      fetch(checkFileUrl, { method: 'HEAD' })
        .then(
          response =>
            response.headers.get('ETag') ||
            response.headers.get('Last-Modified')
        )
        .then(changeFlag => {
          if (!changeFlag) {
            console.log(`Can't get the change flag`);
            clearInterval(clearTimer);
            return;
          }

          if (previousValue === null) {
            previousValue = changeFlag;
          } else if (previousValue !== changeFlag) {
            previousValue = changeFlag;
            ctx.postMessage({
              hasUpdate: true,
            });
          } else {
            ctx.postMessage({
              hasUpdate: false,
            });
          }
        })
        .catch(error => {
          console.error(error);
          clearInterval(clearTimer);
        });
    }, loopMs);
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
