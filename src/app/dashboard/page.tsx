import type { Metadata } from "next";
import { Home01Icon } from "@hugeicons/core-free-icons";

import { SectionStub } from "@/components/ui/section-stub";
import { SECTION_STUBS } from "@/config/navigation";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Overview — TrazeIQ",
};

export default function DashboardPage() {
  const stub = SECTION_STUBS[ROUTES.dashboard];
  return (
    <SectionStub
      icon={Home01Icon}
      title={stub.title}
      body={stub.body}
      note="phase 3c"
    />
  );
}