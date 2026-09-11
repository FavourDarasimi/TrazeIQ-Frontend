import type { Metadata } from "next";

import { AdminPage } from "@/features/platform/components/admin-page";

export const metadata: Metadata = {
  title: "Platform — TrazeIQ",
};

export default function PlatformAdminRoute() {
  return <AdminPage />;
}
