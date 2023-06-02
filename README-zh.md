## 远程文件监控

该库用于监控远程文件是否发生变化，并在变化时通知用户刷新页面。

### 安装

使用 npm 安装远程文件监控库：

```bash
npm install remote-file-monitor
```

### 使用方法

首先，导入所需的模块和接口定义，**默认配置，开箱即用**：

```typescript
import { remoteFileMonitor } from 'remote-file-monitor';

remoteFileMonitor()
```

### 定制参数示例

```typescript
import { remoteFileMonitor } from 'remote-file-monitor';

const config: WorkerConfig = {
  loopMs: 5000,
  checkFileUrl: 'https://example.com/index.html',
  notification: {
    title: '页面已更新！',
    options: {
      dir: 'auto',
      body: '发现新的更新，请点击刷新页面',
      requireInteraction: true,
    },
  },
  clickCallback: () => {
    window.location.reload();
  },
};

remoteFileMonitor(config);
```

这将在指定的时间间隔内检查远程文件是否发生变化，并在变化时发送通知。


### 配置项

以下是可用的配置项及其说明：

- `loopMs`（可选）: 文件检查的时间间隔（毫秒），默认为 5000ms。
- `checkFileUrl`（可选）: 要监控的远程文件的 URL，例如 `https://example.com/index.html`。默认为当前页面的 URL。
- `notification`
  - `notification.title`（必填）: 通知标题，将显示在用户接收到的通知中。
  - `notification.options`（必填）: 通知的选项对象，用于定义通知的其他属性，例如通知正文、通知的方向等。详细属性可以参考 [NotificationOptions](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification)。
  - `clickCallback`（可选）: 点击通知时要执行的回调函数。

### 通知权限

在使用远程文件监控之前，确保已经获得了浏览器的通知权限。否则，你需要请求用户授权：

```typescript
import { requestNotificationPermission } from 'remote-file-monitor';

requestNotificationPermission().then(permission => {
  if (permission === 'granted') {
    // 继续启动文件监控
    remoteFileMonitor(config);
  } else {
    console.log('用户拒绝了通知权限');
  }
});
```

### 注意事项

- 远程文件监控需要在支持 Web Workers 的浏览器中运行。
- 如果浏览器不支持 Web Workers，将会在控制台输出错误信息。
- 请确保远程文件的跨域访问权限已正确配置。
- 远程文件监控只能监控 HTTP/HTTPS 协议下的文件。

这是一个基本的使用示例，你可以根据自己的需求进行配置和扩展。详细的 API 文档可以参考源代码或库的文档。

希望这份文档能够帮助你使用远程文件监控库！如果有任何问题，请随时提问。
