
export interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  business_name?: string;
}

export interface FacebookIntegration {
  id: string;
  user_id: string;
  facebook_user_id: string;
  facebook_user_name: string;
  facebook_user_email: string;
  connected_at: string;
  is_active: boolean;
  ad_accounts: AdAccount[];
  // Adding these fields to make the type compatible with Supabase response
  access_token: string;
  token_expires_in?: number;
}

export interface SyncProgress {
  accountId: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

// Facebook Page and Posts types
export interface FacebookPage {
  id: string;
  name: string;
  likes: number;
  reach: number;
  category: string;
  picture?: string;
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  reach?: number;
  engagement?: number;
}

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  metrics: PostMetrics;
  type: string;
  picture?: string;
}

