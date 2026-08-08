import type { Metadata } from "next";

import { ROUTES } from "@/constants";
import { StubRoute } from "@/components/ui/stub-route";

export const metadata: Metadata = {
  title: "Services — TrazeIQ",
};

export default function ServicesPage() {
  return <StubRoute href={ROUTES.services} />;
}