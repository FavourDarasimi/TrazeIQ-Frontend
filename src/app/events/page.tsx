import type { Metadata } from "next";

import { EventExplorerPage } from "@/features/events/components/event-explorer-page";

export const metadata: Metadata = {
  title: "Event Explorer — TrazeIQ",
};

export default function EventsRoute() {
  return <EventExplorerPage />;
}
