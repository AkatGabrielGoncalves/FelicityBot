export interface BestThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface BestAvatar {
  url: string;
  width: number;
  height: number;
}

export interface Avatar {
  url: string;
  width: number;
  height: number;
}

export interface Author {
  name: string;
  channelID: string;
  url: string;
  bestAvatar: BestAvatar;
  avatars: Avatar[];
  ownerBadges: string[];
  verified: boolean;
}

export interface YouTubeResultItem {
  type: string;
  title: string;
  id: string;
  url: string;
  bestThumbnail: BestThumbnail;
  thumbnails: Thumbnail[];
  isUpcoming: boolean;
  upcoming?: any;
  isLive: boolean;
  badges: string[];
  author: Author;
  description: string;
  views: number;
  duration: string;
  uploadedAt: string;
}
