function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

var startFileMonitorWorker = function startFileMonitorWorker(config) {
  var worker = createWorker(createWorkerFunc);
  worker.onmessage = function (event) {
    var hasUpdate = event.data.hasUpdate;
    if (hasUpdate) {
      notifyToUser(config.notification.title, config.notification.options, config.clickCallback);
    }
  };
  worker.postMessage({
    checkFileUrl: config.checkFileUrl,
    loopMs: config.loopMs,
    getVisibilityState: function getVisibilityState() {
      return document.visibilityState;
    }
  });
};
var createWorker = function createWorker(func) {
  var blob = new Blob(['(' + func.toString() + ')()']);
  var url = window.URL.createObjectURL(blob);
  var worker = new Worker(url);
  return worker;
};
var createWorkerFunc = function createWorkerFunc() {
  var previousValue = null;
  var ctx = self;
  ctx.onmessage = function (event) {
    var _event$data = event.data,
      checkFileUrl = _event$data.checkFileUrl,
      loopMs = _event$data.loopMs,
      getVisibilityState = _event$data.getVisibilityState;
    var clearTimer = setInterval(function () {
      console.log(getVisibilityState(), 'document.visibilityState');
      if (getVisibilityState() === 'visible') {
        fetch(checkFileUrl, {
          method: 'HEAD'
        }).then(function (response) {
          return response.headers.get('ETag') || response.headers.get('Last-Modified');
        }).then(function (changeFlag) {
          if (!changeFlag) {
            console.log("Can't get the change flag");
            clearInterval(clearTimer);
            return;
          }
          if (previousValue === null) {
            previousValue = changeFlag;
          } else if (previousValue !== changeFlag) {
            previousValue = changeFlag;
            ctx.postMessage({
              hasUpdate: true
            });
          } else {
            ctx.postMessage({
              hasUpdate: false
            });
          }
        })["catch"](function (error) {
          console.error(error);
          clearInterval(clearTimer);
        });
      }
    }, loopMs);
  };
  return ctx;
};
var notifyToUser = function notifyToUser(title, options, callback) {
  if (window.Notification) {
    try {
      if (Notification.permission === 'granted') {
        notifyAction(title, options, callback);
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(function (permission) {
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
var notifyAction = function notifyAction(title, options, callback) {
  return new Promise(function (resolve) {
    var notification = new Notification(title, options);
    notification.onclick = function () {
      notification.close();
      callback();
    };
    resolve();
  });
};

var defaultConfig = {
  loopMs: 5000,
  enable: true,
  checkFileUrl: location.origin + "/index.html",
  notification: {
    title: 'Page has Update!',
    options: {
      dir: 'auto',
      body: 'Find upgrades, click me to update',
      requireInteraction: true
    }
  },
  clickCallback: function clickCallback() {
    window.location.reload();
  }
};
function remoteFileMonitor(config) {
  if (config === void 0) {
    config = {};
  }
  var dataItem = _extends({}, defaultConfig, config, {
    notification: _extends({}, defaultConfig.notification, config.notification)
  });
  if (dataItem.enable) {
    if (window.Worker) {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          startFileMonitorWorker(dataItem);
        }
      });
    } else {
      console.log("Your browser doesn't support web workers.");
    }
  }
}

export { remoteFileMonitor };
//# sourceMappingURL=remote-file-monitor.esm.js.map
