/** Authentication and account/profile service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";

export class AuthService {
  constructor(private client: APIClient) {}

  signup(email: string, password: string, name: string) {
    return this.client.post(endpoints.AUTH_SIGNUP, { email, password, name });
  }

  signin(email: string, password: string) {
    return this.client.post(endpoints.AUTH_SIGNIN, { email, password });
  }

  signout() {
    return this.client.post(endpoints.AUTH_SIGNOUT);
  }

  forgotPassword(email: string) {
    return this.client.post(endpoints.AUTH_FORGOT_PASSWORD, { email });
  }

  resetPassword(token: string, password: string) {
    return this.client.post(endpoints.AUTH_RESET_PASSWORD, { token, password });
  }

  me() {
    return this.client.get(endpoints.AUTH_ME);
  }

  updateProfile(fields: Record<string, unknown>) {
    return this.client.patch(endpoints.AUTH_PROFILE, fields);
  }

  onboarding(fields: Record<string, unknown>) {
    return this.client.post(endpoints.AUTH_ONBOARDING, fields);
  }

  oauthProviders() {
    return this.client.get(endpoints.AUTH_OAUTH_PROVIDERS);
  }

  oauthStart(provider: string) {
    return this.client.post(endpoints.AUTH_OAUTH_START(provider));
  }

  tokenRefresh(refresh: string) {
    return this.client.post(endpoints.AUTH_TOKEN_REFRESH, { refresh });
  }
}
