<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemRows, type Problem } from '#lib/kb/problems';

  type Ticket = { url: string; status: string };
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, Ticket>> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const rows = $derived(problemRows(merged, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong>
  {rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>status</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      {@const t = r.problem === 'unplaced' ? undefined : tickets[r.problem]}
      <tr>
        <td><code>{r.problem}</code></td>
        <td>{r.reports}</td>
        <td>{r.tenants}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>{#if t}<a href={t.url}>#{t.url.split('/').pop()}</a>{:else}<span class="warn">none yet</span>{/if}</td>
        <td class:warn={t?.status === 'not planned'}>{t?.status ?? ''}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each rows as r (r.problem)}
  {#if r.oneDay}
    <p class="note">{r.oneDay} of the <code>{r.problem}</code> reports read as a one-day move: counted under <code>{r.problem}</code> by tenant, and again as <code>one-day</code>.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); font-weight: 600; }
</style>
