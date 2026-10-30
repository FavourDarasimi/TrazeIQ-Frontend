import { redirect } from "next/navigation";

import { ROUTES } from "@/constants";

export default function LogsRoute() {
  redirect(ROUTES.events);
}