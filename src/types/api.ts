export type ApiKeyEnvironment = "sandbox" | "production";

export interface ApiKeyResource {
  id: string;
  name: string;
  environment: ApiKeyEnvironment;
  secret_key?: string;
  key_prefix: string;
  last_used_at: string | null;
}

export interface PaymentLinkResource {
  id: string;
  reference: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  checkout_url: string;
}

export interface TransactionResource {
  id: string;
  reference: string;
  provider: string;
  customer_email: string | null;
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  status: string;
  payment_method: string | null;
  checkout_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
}

export interface WalletResource {
  id: string;
  currency: string;
  available_balance: number;
  pending_balance: number;
  updated_at: string;
}

export interface LedgerEntryResource {
  id: string;
  reference: string;
  type: string;
  description: string | null;
  amount: number;
  currency: string;
  direction: "credit" | "debit";
  balance_after: number;
  created_at: string;
}

export interface WithdrawalResource {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  created_at: string;
}

export interface MerchantSettingsResource {
  business: { business_name: string; email: string; phone: string | null; website_url: string | null };
  checkout: { brand_name: string | null; checkout_logo_url: string | null; success_url: string | null; cancel_url: string | null };
  developer: { webhook_url: string | null; webhook_secret: string };
}

// Responses
export interface ApiKeyListResponse { data: ApiKeyResource[]; }
export interface ApiKeyCreatedResponse { message: string; data: ApiKeyResource; }
export interface ApiKeyRevokedResponse { message: string; }
export interface PaymentLinkListResponse { data: PaymentLinkResource[]; }
export interface PaymentLinkResponse { message: string; data: PaymentLinkResource; }
export interface TransactionListResponse { data: TransactionResource[]; }
export interface WalletResponse { data: WalletResource; }
export interface LedgerListResponse { data: LedgerEntryResource[]; }
export interface WithdrawalListResponse { data: WithdrawalResource[]; }
export interface WithdrawalResponse { message: string; data: WithdrawalResource; }
export interface SettingsResponse { data: MerchantSettingsResource; }
export interface AuthTokenPayload { token: string; }
export interface LoginResponse { data: AuthTokenPayload; }
export interface RegisterResponse { data: AuthTokenPayload; }

// Requests
export interface StorePaymentLinkRequest {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  customer_information: { email: string | null; name: string | null };
  expiry: string | null;
  redirect_url: string | null;
  metadata: Record<string, unknown> | null;
}
export interface InitializeWithdrawalRequest {
  amount: number;
  currency: string;
  reference: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  metadata: Record<string, unknown> | null;
}
export interface UpdateMerchantSettingsRequest {
  business_name: string;
  phone: string | null;
  email: string;
  website_url: string | null;
  brand_name: string | null;
  checkout_logo_url: string | null;
  success_url: string | null;
  cancel_url: string | null;
  webhook_url: string | null;
}
export interface UpdatePasswordRequest {
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}
export interface WebhookSecretPayload { webhook_secret: string; }