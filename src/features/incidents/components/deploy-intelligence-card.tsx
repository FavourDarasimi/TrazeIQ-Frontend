"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  FlashIcon,
  Link01Icon,
} from "@hugeicons/core-free-icons";

import { GlassCard } from "@/components/ui/glass-card";
import type { DeployIntelligence } from "@/types";
import { formatDateTime } from "@/utils/format";

interface DeployIntelligenceCardProps {
  intelligence?: DeployIntelligence | null;
}

export function DeployIntelligenceCard({
  intelligence,
}: DeployIntelligenceCardProps) {
  if (!intelligence || !intelligence.has_regression || !intelligence.likely_release) {
    return null;
  }

  const { likely_release: release, confidence } = intelligence;

  const confidenceBadge = {
    high: "border-sev-critical/30 bg-sev-critical/10 text-sev-critical",
    medium: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
    low: "border-line bg-surface text-muted",
  }[confidence];

  const rateDeltaPositive = intelligence.rate_change_percent > 0;

  return (
    <GlassCard className="relative overflow-hidden border-sev-critical/20 p-5 shadow-[0_0_24px_rgba(244,63,94,0.06)]">
      {/* Decorative top accent line */}
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-sev-critical/80 via-accent to-transparent" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-sev-critical/30 bg-sev-critical/10 text-sev-critical">
            <HugeiconsIcon icon={FlashIcon} size={15} color="currentColor" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-ink">
                Likely regression in release {release.version}
              </h3>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${confidenceBadge}`}
              >
                {confidence} confidence
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-muted">
              Deployed {formatDateTime(release.deployed_at)} · {release.environment}
            </p>
          </div>
        </div>

        {release.pull_request_url ? (
          <a
            href={release.pull_request_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 font-mono text-xs text-muted transition-colors hover:border-line-soft hover:bg-bg-panel hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <HugeiconsIcon icon={Link01Icon} size={13} color="currentColor" strokeWidth={1.5} />
            {release.pull_request_title ? release.pull_request_title.slice(0, 32) : "Pull request"} ↗
          </a>
        ) : null}
      </div>

      {/* Grid of Deploy Evidence */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Suspect Commit */}
        <div className="rounded-xl border border-line/60 bg-surface/60 p-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Suspect commit
          </span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate font-mono text-xs font-medium text-ink" title={release.commit_message || release.commit_sha}>
              {release.commit_message || release.commit_sha || "Unknown commit"}
            </p>
            {release.commit_url ? (
              <a
                href={release.commit_url}
                target="_blank"
                rel="noopener noreferrer"
                title="View commit in repository"
                className="shrink-0 text-muted transition-colors hover:text-ink"
              >
                <HugeiconsIcon icon={Link01Icon} size={13} color="currentColor" strokeWidth={1.5} />
              </a>
            ) : null}
          </div>
          {release.commit_author ? (
            <p className="mt-1 truncate font-mono text-[11px] text-muted">
              {release.commit_author}
            </p>
          ) : release.commit_sha ? (
            <p className="mt-1 font-mono text-[11px] text-muted">
              {release.commit_sha.slice(0, 8)}
            </p>
          ) : null}
        </div>

        {/* Error Rate Impact */}
        <div className="rounded-xl border border-line/60 bg-surface/60 p-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Error rate impact
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-sm font-semibold tabular-nums text-ink">
              {intelligence.error_rate_after}
              <span className="text-[10px] font-normal text-muted">/hr</span>
            </span>
            <span
              className={`font-mono text-[11px] font-medium ${
                rateDeltaPositive ? "text-sev-critical" : "text-ok"
              }`}
            >
              {rateDeltaPositive ? "+" : ""}
              {intelligence.rate_change_percent}%
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted">
            from {intelligence.error_rate_before}/hr pre-deploy
          </p>
        </div>

        {/* First Seen Timing */}
        <div className="rounded-xl border border-line/60 bg-surface/60 p-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            First occurrence
          </span>
          <p className="mt-1 font-mono text-xs font-medium text-ink">
            {intelligence.first_seen ? formatDateTime(intelligence.first_seen) : "N/A"}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            post-rollout detection
          </p>
        </div>

        {/* Affected Endpoints */}
        <div className="rounded-xl border border-line/60 bg-surface/60 p-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Affected endpoints
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {intelligence.affected_endpoints && intelligence.affected_endpoints.length > 0 ? (
              intelligence.affected_endpoints.slice(0, 2).map((ep) => (
                <span
                  key={ep}
                  className="inline-block max-w-[140px] truncate rounded bg-bg-panel px-1.5 py-0.5 font-mono text-[10px] text-ink"
                  title={ep}
                >
                  {ep}
                </span>
              ))
            ) : (
              <span className="font-mono text-xs text-muted">Project wide</span>
            )}
            {intelligence.affected_endpoints && intelligence.affected_endpoints.length > 2 ? (
              <span className="font-mono text-[10px] text-muted">
                +{intelligence.affected_endpoints.length - 2} more
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
