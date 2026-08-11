import type { Metadata } from "next";

import { InviteAcceptPage } from "@/features/settings/components/invite-accept-page";

export const metadata: Metadata = {
  title: "Accept invite — TrazeIQ",
};

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export default async function InviteAcceptRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!TOKEN_PATTERN.test(token)) {
    return (
      <p className="text-sm text-muted">
        This invite link looks malformed — check that you copied the full URL.
      </p>
    );
  }
  return <InviteAcceptPage token={token} />;
}
