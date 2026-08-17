import type { Metadata } from "next";

import { ServicesPage } from "@/features/services/components/services-page";

export const metadata: Metadata = {
  title: "Services — TrazeIQ",
};

export default function ServicesRoute() {
  return <ServicesPage />;
}