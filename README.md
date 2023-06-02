## Remote file monitoring

This library is used to monitor whether the remote file has changed, and notify the user to refresh the page when it changes.

### Install

Install the remote file monitoring library using npm:

```bash
npm install remote-file-monitor
```

### Instructions

First, import the required modules and interface definitions:

```typescript
import { WorkerConfig } from 'remote-file-monitor';
```

Then, configure the `WorkerConfig` object according to your needs, and call the `remoteFileMonitor` method to start file monitoring:

```typescript
import { remoteFileMonitor } from 'remote-file-monitor';

const config: WorkerConfig = {
   loopMs: 5000,
   checkFileUrl: 'https://example.com/index.html',
   notification: {
     title: 'The page has been updated! ',
     options: {
       dir: 'auto',
       body: 'Found a new update, please click to refresh the page',
       requireInteraction: true,
     },
   },
   clickCallback: () => {
     window.location.reload();
   },
};

remoteFileMonitor(config);
```

This will check the remote file for changes at the specified interval and send a notification when it changes.

### configuration items

The following configuration items are available and their descriptions:

- `loopMs` (optional): The time interval in milliseconds for file checking, default is 5000ms.
- `checkFileUrl` (optional): The URL of the remote file to monitor, e.g. `https://example.com/index.html`. Defaults to the URL of the current page.
- `notification`
  - `notification.title` (required): The title of the notification, which will be displayed in the notification received by the user.
  - `notification.options` (required): The options object of the notification, which is used to define other properties of the notification, such as the notification body, the direction of the notification, etc. For detailed properties, please refer to [NotificationOptions](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification).
  - `clickCallback` (optional): The callback function to be executed when the notification is clicked.

### Notification permissions

Before using remote file monitoring, make sure you have obtained the notification permission of the browser. Otherwise, you need to request user authorization:

```typescript
import { requestNotificationPermission } from 'remote-file-monitor';

requestNotificationPermission().then(permission => {
   if (permission === 'granted') {
     // Continue to start file monitoring
     remoteFileMonitor(config);
   } else {
     console.log('User denied notification permission');
   }
});
```

### Precautions

- Remote file monitoring needs to run in a browser that supports Web Workers.
- If the browser does not support Web Workers, an error message will be output to the console.
- Please ensure that cross-origin access to remote files is properly configured.
- Remote file monitoring can only monitor files under the HTTP/HTTPS protocol.

This is a basic usage example, you can configure and extend it according to your needs. Detailed API documentation can refer to source code or library documentation.

Hope this document helps you to use the remote file monitoring library! If you have any questions, please feel free to ask.
