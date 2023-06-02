export interface WorkerConfig {
  loopMs?: number;
  checkFileUrl?: string;
  notification?: {
    title: string;
    options: NotificationOptions;
  };
  clickCallback?: () => void;
}
