import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type { Organization } from "@/types";

export function listOrganizations(): Promise<{ organizations: Organization[] }> {
  return api<{ organizations: Organization[] }>(API_ROUTES.organizations);
}

export function createOrganization(name: string): Promise<{ organization: Organization }> {
  return api<{ organization: Organization }>(API_ROUTES.organizations, {
    method: "POST",
    body: { name },
  });
}