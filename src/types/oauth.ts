
export interface OAuthResponse {
  status: 'success' | 'error';
  message?: string;
  authUrl?: string;
  error?: string;
}

export interface SyncDataResponse {
  success?: boolean;
  error?: string;
}
