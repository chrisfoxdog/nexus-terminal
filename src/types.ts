export type ProductCategory =
  | 'all'
  | 'trading'
  | 'saas'
  | 'education'
  | 'sports'
  | 'coaching';

export type AppIframeType =
  | 'signals'
  | 'course'
  | 'file_vault'
  | 'license_api'
  | 'chat';

export interface ProductPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly' | 'one_time';
  trialDays?: number;
  description: string;
}

export interface WhopProduct {
  id: string;
  title: string;
  creatorName: string;
  creatorAvatar: string;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  totalMembers: number;
  coverImage: string;
  icon: string;
  badge?: string;
  shortTagline: string;
  fullDescription: string;
  plans: ProductPlan[];
  features: string[];
  perks: {
    discordServer?: string;
    hasAppWidget: boolean;
    appType: AppIframeType;
    downloadFilesCount?: number;
    lessonsCount?: number;
  };
  sampleReviews: {
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export interface AccessPass {
  id: string;
  productId: string;
  productTitle: string;
  creatorName: string;
  icon: string;
  coverImage: string;
  licenseKey: string;
  status: 'active' | 'expired' | 'canceled';
  planName: string;
  pricePaid: number;
  createdAt: string;
  expiresAt: string;
  discordConnected: boolean;
  appType: AppIframeType;
  isTrialActive?: boolean;
}

export interface SignalAlert {
  id: string;
  asset: string;
  action: 'BUY / LONG' | 'SELL / SHORT';
  entry_zone: string;
  target_1: string;
  target_2: string;
  stop_loss: string;
  risk_reward: string;
  reasoning: string;
  timestamp: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  summary: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  timestamp: string;
  status: '200 OK' | '400 Error';
  payload: any;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isCreator?: boolean;
}