export interface QueueItem {
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
}

export interface ItemInformation {
  tracks?: QueueItem[];
  track?: QueueItem;
  url: string;
  title: string;
}
