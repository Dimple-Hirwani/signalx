export interface User {
  id: string;
  phone: string;
  display_name: string;
  avatar_url: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
