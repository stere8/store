import Link from "next/link";
import { FlashMessage } from "@/components/frontadmin/ui/flash-message";
import { MetricCard } from "@/components/frontadmin/ui/metric-card";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { formatDateTime } from "@/lib/admin-ui";
import {
  archiveCustomerAction,
  deleteClerkUserAction,
  ignoreCustomerReconciliationIssueAction,
  syncCustomerFromClerkAction,
  unignoreCustomerReconciliationIssueAction,
} from "@/lib/admin-actions";
import {
  getCustomerReconciliationSnapshot,
  type CustomerIdentityField,
  type CustomerReconciliationBucket,
  type CustomerReconciliationRecord,
} from "@/lib/customer-reconciliation";

type SearchParams = {
  q?: string;
  success?: string;
  error?: string;
  showIgnored?: string;
};

const primaryButtonClass =
  "rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200";

const secondaryButtonClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

const mutedButtonClass =
  "rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5";

const dangerButtonClass =
  "rounded-full border border-rose-400/35 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400 hover:text-slate-950";

const issueTypeTone: Record<
  CustomerReconciliationRecord["issueType"],
  string
> = {
  "clerk-only": "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/30",
  "db-only": "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30",
  mismatched: "bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/30",
};

const buildPageHref = (query?: string, showIgnored?: boolean) => {
  const params = new URLSearchParams();

  if (query && query.trim().length > 0) {
    params.set("q", query.trim());
  }

  if (showIgnored) {
    params.set("showIgnored", "1");
  }

  return params.size > 0
    ? `/admin/reconciliation?${params.toString()}`
    : "/admin/reconciliation";
};

const getIdentityFieldLabel = (field: CustomerIdentityField) => {
  switch (field) {
    case "username":
      return "Clerk ID link";
    case "fullName":
      return "Full name";
    case "email":
      return "Email";
    case "phoneNumber":
      return "Phone number";
    default:
      return field;
  }
};

function IdentityBlock({
  label,
  title,
  subtitle,
  meta,
}: {
  label: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/60 p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-base font-semibold text-white">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
      {meta ? <p className="mt-2 text-xs text-slate-500">{meta}</p> : null}
    </div>
  );
}

function IssueActions({
  record,
  returnTo,
}: {
  record: CustomerReconciliationRecord;
  returnTo: string;
}) {
  const preferredLanguage = record.customer?.preferredLanguage || "en";

  return (
    <div className="flex flex-wrap gap-3">
      {record.clerkUser ? (
        <form action={syncCustomerFromClerkAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="username" value={record.clerkUser.id} />
          <input type="hidden" name="fullName" value={record.clerkUser.fullName} />
          <input type="hidden" name="phoneNumber" value={record.clerkUser.phoneNumber} />
          <input type="hidden" name="email" value={record.clerkUser.email || ""} />
          <input type="hidden" name="preferredLanguage" value={preferredLanguage} />
          <button className={primaryButtonClass}>Sync to DB</button>
        </form>
      ) : null}

      {record.issueType === "clerk-only" && record.clerkUser ? (
        <form action={deleteClerkUserAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="clerkUserId" value={record.clerkUser.id} />
          <button className={dangerButtonClass}>Delete in Clerk</button>
        </form>
      ) : null}

      {record.issueType === "db-only" && record.customer ? (
        <form action={archiveCustomerAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="customerId" value={record.customer.id} />
          <input
            type="hidden"
            name="reason"
            value="Archived local-only record from admin reconciliation."
          />
          <button className={mutedButtonClass}>Archive local only</button>
        </form>
      ) : null}

      <form action={ignoreCustomerReconciliationIssueAction}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="issueType" value={record.issueType} />
        <input type="hidden" name="subjectKey" value={record.subjectKey} />
        <input type="hidden" name="fingerprint" value={record.fingerprint} />
        <button className={mutedButtonClass}>Ignore</button>
      </form>
    </div>
  );
}

function ActiveIssueCard({
  record,
  returnTo,
}: {
  record: CustomerReconciliationRecord;
  returnTo: string;
}) {
  const reservationLabel =
    record.reservationCount === 1
      ? "1 reservation"
      : `${record.reservationCount} reservations`;

  const activityMeta = record.clerkUser?.lastSignInAt
    ? `Last sign-in ${formatDateTime(record.clerkUser.lastSignInAt)}`
    : record.clerkUser?.createdAt
      ? `Clerk created ${formatDateTime(record.clerkUser.createdAt)}`
      : null;

  return (
    <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${issueTypeTone[record.issueType]}`}
            >
              {record.issueType.replace("-", " ")}
            </span>
            {record.matchSource && record.matchSource !== "username" ? (
              <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                matched by {record.matchSource}
              </span>
            ) : null}
            <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              {reservationLabel}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-white">
            {record.clerkUser?.fullName ||
              record.customer?.fullName ||
              record.clerkUser?.id ||
              record.customer?.username}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {record.issueType === "mismatched"
              ? "Clerk and the local customer record both exist, but the identity fields disagree."
              : record.issueType === "clerk-only"
                ? "Clerk has a user the local customer table does not know about yet."
                : "The local customer record has no matching Clerk identity and should be treated as history-only unless relinked."}
          </p>
        </div>

        <IssueActions record={record} returnTo={returnTo} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {record.clerkUser ? (
          <IdentityBlock
            label="Clerk"
            title={record.clerkUser.fullName}
            subtitle={record.clerkUser.email || record.clerkUser.phoneNumber}
            meta={`${record.clerkUser.id}${activityMeta ? ` • ${activityMeta}` : ""}`}
          />
        ) : (
          <IdentityBlock
            label="Clerk"
            title="No Clerk identity"
            subtitle="This issue only exists in the local database."
            meta={null}
          />
        )}

        {record.customer ? (
          <IdentityBlock
            label="Local DB"
            title={record.customer.fullName}
            subtitle={record.customer.email || record.customer.phoneNumber}
            meta={`${record.customer.username}${record.customer.archivedAt ? ` • archived ${formatDateTime(record.customer.archivedAt)}` : ""}`}
          />
        ) : (
          <IdentityBlock
            label="Local DB"
            title="No local customer record"
            subtitle="A sync will create or relink the database record from Clerk."
            meta={null}
          />
        )}
      </div>

      {record.mismatches.length > 0 ? (
        <div className="mt-5 rounded-[1.35rem] border border-rose-400/20 bg-rose-400/5 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-rose-200">
            Identity mismatches
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {record.mismatches.map((mismatch) => (
              <div
                key={mismatch.field}
                className="rounded-2xl border border-white/10 bg-slate-950/65 p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {getIdentityFieldLabel(mismatch.field)}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-cyan-200">
                  Clerk
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {mismatch.clerkValue || "Empty"}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-amber-200">
                  Local DB
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {mismatch.dbValue || "Empty"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function BucketSection({
  bucket,
  returnTo,
}: {
  bucket: CustomerReconciliationBucket;
  returnTo: string;
}) {
  return (
    <Panel className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-bold text-white">{bucket.label}</h3>
          <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            {bucket.items.length}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          {bucket.description}
        </p>
      </div>

      {bucket.items.length > 0 ? (
        <div className="space-y-4">
          {bucket.items.map((record) => (
            <ActiveIssueCard
              key={`${record.issueType}:${record.subjectKey}`}
              record={record}
              returnTo={returnTo}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-slate-950/35 px-5 py-6 text-sm text-slate-400">
          No active items in this bucket for the current filter.
        </div>
      )}
    </Panel>
  );
}

function IgnoredIssueCard({
  record,
  returnTo,
}: {
  record: CustomerReconciliationRecord;
  returnTo: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/45 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {record.clerkUser?.fullName ||
              record.customer?.fullName ||
              record.clerkUser?.id ||
              record.customer?.username}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {record.issueType.replace("-", " ")} • {record.subjectKey}
          </p>
        </div>

        <form action={unignoreCustomerReconciliationIssueAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="issueType" value={record.issueType} />
          <input type="hidden" name="subjectKey" value={record.subjectKey} />
          <button className={mutedButtonClass}>Restore issue</button>
        </form>
      </div>
    </div>
  );
}

export default async function ReconciliationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams.q || "";
  const showIgnored = searchParams.showIgnored === "1";
  const returnTo = buildPageHref(query, showIgnored);

  let snapshot:
    | Awaited<ReturnType<typeof getCustomerReconciliationSnapshot>>
    | null = null;
  let loadError: string | null = null;

  try {
    snapshot = await getCustomerReconciliationSnapshot(query);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Failed to load Clerk reconciliation data.";
  }

  const toggleIgnoredHref = buildPageHref(query, !showIgnored);
  const mismatchedCount =
    snapshot?.buckets.find((bucket) => bucket.id === "mismatched")?.items.length || 0;
  const clerkOnlyCount =
    snapshot?.buckets.find((bucket) => bucket.id === "clerk-only")?.items.length || 0;
  const dbOnlyCount =
    snapshot?.buckets.find((bucket) => bucket.id === "db-only")?.items.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Identity"
        title="Clerk reconciliation"
        description="Review where Clerk and the local customer table disagree. Clerk is the source of truth for identity fields, while local-only records can be archived or ignored deliberately."
        actions={
          <>
            <Link href="/admin/customers" className={secondaryButtonClass}>
              Customer records
            </Link>
            <Link href={returnTo} className={secondaryButtonClass}>
              Refresh from Clerk
            </Link>
            <Link href={toggleIgnoredHref} className={secondaryButtonClass}>
              {showIgnored ? "Hide ignored" : "Show ignored"}
            </Link>
          </>
        }
      />

      <FlashMessage kind="success" message={searchParams.success} />
      <FlashMessage kind="error" message={searchParams.error} />

      <Panel>
        <form className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Filter by Clerk id, name, email, phone, or local username"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          {showIgnored ? <input type="hidden" name="showIgnored" value="1" /> : null}
          <button className={primaryButtonClass}>Filter issues</button>
          <Link href={buildPageHref(undefined, showIgnored)} className={mutedButtonClass}>
            Clear
          </Link>
        </form>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          This page resolves drift between Clerk and the local customer table. Clerk-first
          deletes belong here only for Clerk-only identities; linked-user delete cleanup still
          depends on the automatic sync plumbing branch.
        </p>
      </Panel>

      {loadError ? (
        <Panel>
          <p className="text-xs uppercase tracking-[0.22em] text-rose-200">Load failure</p>
          <h3 className="mt-3 text-2xl font-bold text-white">
            Reconciliation data is unavailable.
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{loadError}</p>
        </Panel>
      ) : snapshot ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Active issues"
              value={snapshot.activeCount}
              detail={`${snapshot.clerkUsersCount} Clerk users checked against ${snapshot.dbCustomersCount} active DB customers.`}
            />
            <MetricCard
              label="Both mismatched"
              value={mismatchedCount}
              detail="These should usually be resolved by syncing Clerk back into the DB."
            />
            <MetricCard
              label="Clerk only"
              value={clerkOnlyCount}
              detail="These identities exist in Clerk but not in the local customer table."
            />
            <MetricCard
              label="DB only"
              value={dbOnlyCount}
              detail={`${snapshot.ignoredCount} ignored items currently hidden from active buckets.`}
            />
          </div>

          {snapshot.buckets.map((bucket) => (
            <BucketSection key={bucket.id} bucket={bucket} returnTo={returnTo} />
          ))}

          {showIgnored ? (
            <Panel className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold text-white">Ignored issues</h3>
                <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {snapshot.ignoredItems.length}
                </span>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-slate-400">
                Ignored items stay hidden only while the reconciliation fingerprint is unchanged.
                If the underlying Clerk or DB data changes, the issue will surface again.
              </p>

              {snapshot.ignoredItems.length > 0 ? (
                <div className="space-y-3">
                  {snapshot.ignoredItems.map((record) => (
                    <IgnoredIssueCard
                      key={`${record.issueType}:${record.subjectKey}`}
                      record={record}
                      returnTo={returnTo}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-slate-950/35 px-5 py-6 text-sm text-slate-400">
                  No ignored reconciliation items match the current filter.
                </div>
              )}
            </Panel>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
