/** Teams, members, and invitations service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class TeamsService extends BaseService {
  constructor(client: APIClient) {
    super(client, endpoints.TEAMS, endpoints.TEAM_DETAIL);
  }

  listMembers(teamId: string | number) {
    return this.client.get(endpoints.TEAM_MEMBERS(teamId));
  }

  addMember(teamId: string | number, user: string | number, role = "member") {
    return this.client.post(endpoints.TEAM_MEMBERS(teamId), { user, role });
  }

  removeMember(teamId: string | number, userId: string | number) {
    return this.client.delete(endpoints.TEAM_MEMBER_DETAIL(teamId, userId));
  }

  listInvitations(teamId: string | number) {
    return this.client.get(endpoints.TEAM_INVITATIONS(teamId));
  }

  createInvitation(teamId: string | number, email: string, role = "member") {
    return this.client.post(endpoints.TEAM_INVITATIONS(teamId), { email, role });
  }

  acceptInvitation(token: string) {
    return this.client.post(endpoints.TEAM_INVITATION_ACCEPT(token));
  }

  declineInvitation(token: string) {
    return this.client.post(endpoints.TEAM_INVITATION_DECLINE(token));
  }
}
