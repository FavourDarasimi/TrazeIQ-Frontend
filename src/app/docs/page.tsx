import { DocsPage } from "@/features/docs/components/docs-page";
import { AuthProvider } from "@/providers/auth-provider";

export default function Docs() {
  return (
    <AuthProvider>
      <DocsPage />
    </AuthProvider>
  );
}
