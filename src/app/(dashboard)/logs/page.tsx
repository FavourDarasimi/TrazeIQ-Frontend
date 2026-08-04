import type { Metadata } from "next";

import { ROUTES } from "@/constants";
import { StubRoute } from "@/app/(dashboard)/stub-route";

export const metadata: Metadata = {
  title: "Logs — TrazeIQ",
};

export default function LogsPage() {
  return <StubRoute href={ROUTES.logs} />;
}