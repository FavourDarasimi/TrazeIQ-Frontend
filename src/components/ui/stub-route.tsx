import { SectionStub } from "@/components/ui/section-stub";
import { DASHBOARD_NAV, SECTION_STUBS } from "@/config/navigation";

export function StubRoute({ href }: { href: string }) {
  const item = DASHBOARD_NAV.find((nav) => nav.href === href);
  const stub = SECTION_STUBS[href];
  if (!item || !stub) return null;
  return (
    <SectionStub
      icon={item.icon}
      title={stub.title}
      body={stub.body}
      note={item.stub}
    />
  );
}