
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
}

export interface SyncProgress {
  accountId: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}
