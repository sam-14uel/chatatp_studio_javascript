/** Users and invitations service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class UsersService extends BaseService {
  constructor(client: APIClient) {
    super(client, endpoints.USERS, endpoints.USER_DETAIL);
  }

  listInvitations() {
    return this.client.get(endpoints.USER_INVITATIONS);
  }

  acceptInvitation(token: string) {
    return this.client.post(endpoints.USER_INVITATION_ACCEPT(token));
  }

  declineInvitation(token: string) {
    return this.client.post(endpoints.USER_INVITATION_DECLINE(token));
  }
}
