export interface WorkerConfig {
  loopMs?: number;
  enable?: boolean;
  checkFileUrl?: string;
  notification?: {
    title: string;
    options: NotificationOptions;
  };
  clickCallback?: () => void;
}
