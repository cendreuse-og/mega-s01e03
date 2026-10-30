// The problems inside #4471, counted the desk's way: causes.ts by tenant and form, with the reports
// the desk read as a one-day move (desk-notes.json) counted where they're filed and also shown as
// a problem of their own. A date one day off is not a month flipped.
import { groupByCause, readAs, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: number;
  // For a cause: how many of its reports are also the one-day problem.
  oneDay: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function problemRows(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemRow[] {
  const groups = groupByCause(reports, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    oneDay: readAs(g, oneDayMove),
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
  }));
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'one-day',
      reports: moved.length,
      oneDay: 0,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
    });
  }
  return rows;
}
