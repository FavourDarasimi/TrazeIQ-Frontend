"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  FolderCodeIcon,
  Key01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";

import { CodeBlock } from "@/components/ui/code-block";
import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { createOrganization } from "@/services/organizations";
import { createProject } from "@/services/projects";
import { loadWorkspace, type WorkspaceSnapshot } from "@/services/workspace";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";
import type { CreatedProject, Organization, Project } from "@/types";

type Stage = "loading" | "org" | "project" | "key" | "done" | "error";

function StepHeader({ icon, step, title, sub }: { icon: ReactNode; step: string; title: string; sub: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        {step} <span className="text-accent">/</span> {title}
      </p>
      <div className="mt-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-muted">
          {icon}
        </span>
        <span className="text-xl font-semibold tracking-tight text-ink">{sub}</span>
      </div>
    </div>
  );
}

export function OnboardingFlow() {
  const { signOut } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("loading");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [created, setCreated] = useState<CreatedProject | null>(null);

  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectEnv, setProjectEnv] = useState("production");
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function applySnapshot(snapshot: WorkspaceSnapshot) {
    setOrgs(snapshot.organizations);
    setProjects(snapshot.projects);
    setSelectedOrgId(snapshot.organizations[0]?.id ?? null);
    if (snapshot.organizations.length === 0) {
      setStage("org");
    } else if (snapshot.projects.length === 0) {
      setStage("project");
    } else {
      setStage("done");
    }
  }

  function handleLoadError(err: unknown) {
    setError(apiErrorMessage(err));
    setStage("error");
  }

  function retry() {
    setError(null);
    setStage("loading");
    loadWorkspace().then(applySnapshot).catch(handleLoadError);
  }

  useEffect(() => {
    let cancelled = false;
    loadWorkspace()
      .then((snapshot) => {
        if (!cancelled) applySnapshot(snapshot);
      })
      .catch((err: unknown) => {
        if (!cancelled) handleLoadError(err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await signOut();
    router.replace(ROUTES.login);
  }

  async function submitOrg(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const { organization } = await createOrganization(orgName);
      setOrgs([organization]);
      setSelectedOrgId(organization.id);
      setStage("project");
    } catch (err) {
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  async function submitProject(event: FormEvent) {
    event.preventDefault();
    const organization = selectedOrgId ?? orgs[0]?.id;
    if (organization === undefined) return;
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const createdProject = await createProject({
        name: projectName,
        organization,
        environment: projectEnv,
      });
      setCreated(createdProject);
      setProjects([createdProject.project]);
      setStage("key");
    } catch (err) {
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  function finishReveal() {
    setCreated(null);
    setStage("done");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-sm font-semibold tracking-tight text-ink">
          traze<span className="text-accent">iq</span>
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
        >
          <HugeiconsIcon icon={Logout01Icon} size={15} color="currentColor" strokeWidth={1.5} />
          Log out
        </button>
      </div>

      {stage === "loading" ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-soft border-t-accent" />
          <span className="font-mono text-xs text-muted">loading workspace</span>
        </div>
      ) : null}

      {stage === "org" ? (
        <form onSubmit={submitOrg} className="flex flex-col gap-4" noValidate>
          <StepHeader
            icon={<HugeiconsIcon icon={Building01Icon} size={18} color="currentColor" strokeWidth={1.5} />}
            step="setup 01"
            title="Workspace"
            sub="Name your organization"
          />
          <p className="-mt-1 text-sm text-muted">
            Your organization groups all projects, so your team stays one step away
            from every incident.
          </p>
          {error ? <InlineError>{error}</InlineError> : null}
          <TextField
            label="Organization name"
            placeholder="Acme Inc."
            value={orgName}
            onChange={(event) => setOrgName(event.target.value)}
            error={fieldErrors.name?.[0]}
          />
          <SubmitButton loading={busy} loadingLabel="Creating…">
            Create organization
          </SubmitButton>
        </form>
      ) : null}

      {stage === "project" ? (
        <form onSubmit={submitProject} className="flex flex-col gap-4" noValidate>
          <StepHeader
            icon={<HugeiconsIcon icon={FolderCodeIcon} size={18} color="currentColor" strokeWidth={1.5} />}
            step="setup 02"
            title="Project"
            sub="Create your first project"
          />
          <p className="-mt-1 text-sm text-muted">
            A project maps to an app or service you want to monitor.
          </p>
          {error ? <InlineError>{error}</InlineError> : null}

          {orgs.length > 1 ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                Organization
              </span>
              <select
                value={selectedOrgId ?? ""}
                onChange={(event) => setSelectedOrgId(Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <TextField
            label="Project name"
            placeholder="web-app"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            error={fieldErrors.name?.[0]}
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
              Environment
            </span>
            <select
              value={projectEnv}
              onChange={(event) => setProjectEnv(event.target.value)}
              className="h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
            >
              <option value="production">production</option>
              <option value="staging">staging</option>
              <option value="development">development</option>
            </select>
          </label>

          <SubmitButton loading={busy} loadingLabel="Creating…">
            Create project
          </SubmitButton>
        </form>
      ) : null}

      {stage === "key" && created ? (
        <div className="flex flex-col gap-4">
          <StepHeader
            icon={<HugeiconsIcon icon={Key01Icon} size={18} color="currentColor" strokeWidth={1.5} />}
            step="setup 03"
            title="API key"
            sub="Your API key — shown once"
          />

          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-sev-warning/30 bg-sev-warning/10 px-3 py-2.5 text-sm text-sev-warning"
          >
            <span>
              Copy it now — this is the only time the raw key is shown. After you
              leave this screen you&apos;ll only ever see its prefix.
            </span>
          </div>

          <CodeBlock title="X-API-Key" code={created.api_key} />
          <CodeBlock title="Send your first event" code={created.integration_snippet} />

          <SubmitButton onClick={finishReveal}>I saved my key — continue</SubmitButton>
        </div>
      ) : null}

      {stage === "done" ? (
        <div className="flex flex-col gap-4">
          <StepHeader
            icon={<HugeiconsIcon icon={FolderCodeIcon} size={18} color="currentColor" strokeWidth={1.5} />}
            step="setup complete"
            title="Workspace ready"
            sub="You&apos;re set up"
          />

          <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
            {orgs.map((org) => (
              <div key={org.id} className="text-sm">
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {org.name}
                </span>
              </div>
            ))}
            <div className="mt-2 flex flex-col gap-1.5 border-t border-line pt-2">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{project.name}</span>
                  <span className="font-mono text-xs text-muted">
                    {project.api_key_prefix}…
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
          >
            Continue to dashboard
          </Link>
          <p className="text-center text-xs text-muted">
            The dashboard shell lands in the next build phase.
          </p>
        </div>
      ) : null}

      {stage === "error" ? (
        <div className="flex flex-col gap-4">
          <div role="alert" className="flex flex-col gap-3">
            <InlineError>{error ?? "Could not load your workspace."}</InlineError>
            <SubmitButton onClick={retry}>Try again</SubmitButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}