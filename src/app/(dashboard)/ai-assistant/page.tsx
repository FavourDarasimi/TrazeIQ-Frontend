import type { Metadata } from "next";

import { ROUTES } from "@/constants";
import { StubRoute } from "@/app/(dashboard)/stub-route";

export const metadata: Metadata = {
  title: "AI Assistant — TrazeIQ",
};

export default function AiAssistantPage() {
  return <StubRoute href={ROUTES.aiAssistant} />;
}