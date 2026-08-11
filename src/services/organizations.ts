import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type {
  InviteAcceptResult,
  InviteCreated,
  MembershipRole,
  Organization,
  OrganizationMembership,
} from "@/types";

export function listOrganizations(): Promise<{ organizations: Organization[] }> {
  return api<{ organizations: Organization[] }>(API_ROUTES.organizations);
}

export function createOrganization(name: string): Promise<{ organization: Organization }> {
  return api<{ organization: Organization }>(API_ROUTES.organizations, {
    method: "POST",
    body: { name },
  });
}

export function listMembers(
  organizationId: string,
  signal?: AbortSignal,
): Promise<{ members: OrganizationMembership[] }> {
  return api<{ members: OrganizationMembership[] }>(
    `${API_ROUTES.organizations}${organizationId}/members/`,
    { signal },
  );
}

export function inviteMember(
  organizationId: string,
  email: string,
  role: MembershipRole,
): Promise<InviteCreated> {
  return api<InviteCreated>(
    `${API_ROUTES.organizations}${organizationId}/invite/`,
    { method: "POST", body: { email, role } },
  );
}

export function acceptInvite(token: string): Promise<InviteAcceptResult> {
  return api<InviteAcceptResult>(`${API_ROUTES.invites}${token}/accept/`, {
    method: "POST",
  });
}