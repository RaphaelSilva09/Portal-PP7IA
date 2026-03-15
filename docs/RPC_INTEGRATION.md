# RPC Integration Guide - Materialized View Refresh

This document explains how to integrate the Materialized View (MV) refresh RPC functions into your admin repository methods.

## Overview

After Phase 1 and Phase 3 migrations, we have two materialized views that need to be refreshed when content changes:

1. **`mv_home_latest_dates`** - Caches the latest update timestamps from 6 content tables
2. **`mv_admin_dashboard_stats`** - Caches aggregated statistics for the admin dashboard

These views are refreshed via RPC functions that run `REFRESH MATERIALIZED VIEW CONCURRENTLY`.

## When to Refresh

**ALWAYS refresh BOTH materialized views** after any of these operations on content tables:
- INSERT (creating new content)
- UPDATE (editing existing content)
- DELETE (removing content)

**Content tables that trigger refresh**:
- `biblioteca`
- `ebooks`
- `especial_semana`
- `estudar`
- `mini_livros`
- `newsletters`
- `radar_oportunidades`
- `users` (only when admin status changes)

## How to Integrate

### Pattern (TypeScript)

Add this code **after** your successful INSERT/UPDATE/DELETE operation:

```typescript
// After successful content operation (INSERT/UPDATE/DELETE)

// Refresh home dates MV
const { error: refreshError1 } = await supabase.rpc('refresh_mv_home_latest_dates');
if (refreshError1) {
  console.error('[MV Refresh] Failed to refresh mv_home_latest_dates:', refreshError1.message);
}

// Refresh admin dashboard stats MV
const { error: refreshError2 } = await supabase.rpc('refresh_mv_admin_dashboard_stats');
if (refreshError2) {
  console.error('[MV Refresh] Failed to refresh mv_admin_dashboard_stats:', refreshError2.message);
}
```

### Example: Newsletter Repository

```typescript
// File: frontend/infrastructure/repositories/SupabaseNewsletterRepository.ts

async create(newsletter: Newsletter): Promise<void> {
  const { error: insertError } = await this.supabase
    .from('newsletters')
    .insert({ /* ... */ });

  if (insertError) {
    throw new Error(`Failed to create newsletter: ${insertError.message}`);
  }

  // Refresh materialized views (non-blocking)
  const { error: refreshError1 } = await this.supabase.rpc('refresh_mv_home_latest_dates');
  if (refreshError1) {
    console.error('[MV Refresh] Failed to refresh mv_home_latest_dates:', refreshError1.message);
  }

  const { error: refreshError2 } = await this.supabase.rpc('refresh_mv_admin_dashboard_stats');
  if (refreshError2) {
    console.error('[MV Refresh] Failed to refresh mv_admin_dashboard_stats:', refreshError2.message);
  }
}

async update(id: string, newsletter: Partial<Newsletter>): Promise<void> {
  const { error: updateError } = await this.supabase
    .from('newsletters')
    .update({ /* ... */ })
    .eq('id', id);

  if (updateError) {
    throw new Error(`Failed to update newsletter: ${updateError.message}`);
  }

  // Refresh materialized views (non-blocking)
  const { error: refreshError1 } = await this.supabase.rpc('refresh_mv_home_latest_dates');
  if (refreshError1) {
    console.error('[MV Refresh] Failed to refresh mv_home_latest_dates:', refreshError1.message);
  }

  const { error: refreshError2 } = await this.supabase.rpc('refresh_mv_admin_dashboard_stats');
  if (refreshError2) {
    console.error('[MV Refresh] Failed to refresh mv_admin_dashboard_stats:', refreshError2.message);
  }
}

async delete(id: string): Promise<void> {
  const { error: deleteError } = await this.supabase
    .from('newsletters')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new Error(`Failed to delete newsletter: ${deleteError.message}`);
  }

  // Refresh materialized views (non-blocking)
  const { error: refreshError1 } = await this.supabase.rpc('refresh_mv_home_latest_dates');
  if (refreshError1) {
    console.error('[MV Refresh] Failed to refresh mv_home_latest_dates:', refreshError1.message);
  }

  const { error: refreshError2 } = await this.supabase.rpc('refresh_mv_admin_dashboard_stats');
  if (refreshError2) {
    console.error('[MV Refresh] Failed to refresh mv_admin_dashboard_stats:', refreshError2.message);
  }
}
```

## Important Rules

### DO ✅

1. **Always use `await`** - Never fire-and-forget the RPC calls
2. **Always refresh BOTH MVs** - No conditional logic, always call both functions
3. **Log errors** - Use structured logging with `[MV Refresh]` prefix
4. **Place after main operation** - Only refresh if the main operation succeeded
5. **Don't throw exceptions** - The main operation already succeeded, just log the refresh error

### DON'T ❌

1. **Never fire-and-forget** - Don't use `void supabase.rpc(...)` pattern
2. **Never add conditional logic** - Don't try to optimize which MVs to refresh
3. **Never throw exceptions on refresh error** - The main operation succeeded, don't fail the entire operation
4. **Never skip error logging** - Always log refresh failures for debugging
5. **Never call before main operation** - Only refresh after successful INSERT/UPDATE/DELETE

## Security

Both RPC functions have:
- **`SECURITY DEFINER`** - Runs with elevated privileges to bypass RLS
- **Admin check** - Verifies `auth.jwt() ->> 'is_admin' = 'true'`
- **`SET search_path = public`** - Prevents search path attacks
- **Access control** - Granted to `authenticated`, revoked from `anon` and `public`

Non-admin users attempting to call these functions will receive:
```
ERROR: Only administrators can refresh materialized views
```

## Performance Considerations

### Refresh Duration
- **`REFRESH CONCURRENTLY`** allows reads during refresh
- Typical refresh time: **50-200ms** (depends on data volume)
- No blocking for end users
- Admin operations may take slightly longer (acceptable)

### Frequency
- Manual refresh only (no automatic triggers)
- Triggered by admin content operations only
- No impact on public users reading data

### Optimization
- Both MVs have **unique indices** required for CONCURRENT refresh
- `mv_home_latest_dates` index: `(table_name)`
- `mv_admin_dashboard_stats` index: `(metric_name)`

## Troubleshooting

### Error: "Only administrators can refresh materialized views"
**Cause**: User is not an admin or session expired
**Solution**: Verify `users.is_admin = true` in database and re-authenticate

### Error: "relation does not exist"
**Cause**: Migration scripts not executed
**Solution**: Run migrations in order (phase1 → phase2 → phase3)

### Error: "could not create unique index"
**Cause**: Duplicate rows in materialized view
**Solution**: Check base tables for data integrity issues

### RPC call takes too long (>5s)
**Cause**: Large dataset or missing indices
**Solution**: Verify unique indices exist on MVs, check query execution plan

## Testing

### Manual Testing
```sql
-- Test as admin user (in Supabase SQL Editor)
SELECT refresh_mv_home_latest_dates();
SELECT refresh_mv_admin_dashboard_stats();

-- Verify data updated
SELECT * FROM mv_home_latest_dates;
SELECT * FROM mv_admin_dashboard_stats;
```

### Integration Testing
```typescript
// Test in your admin repository test suite
describe('Newsletter Repository - MV Refresh', () => {
  it('should refresh MVs after creating newsletter', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    
    await repository.create(mockNewsletter);
    
    // Should not log errors if refresh succeeded
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('[MV Refresh]')
    );
  });
});
```

## Migration Checklist

When adding RPC refresh calls to a repository:

- [ ] Add after INSERT operations
- [ ] Add after UPDATE operations
- [ ] Add after DELETE operations
- [ ] Use `await` (not fire-and-forget)
- [ ] Refresh BOTH MVs (not just one)
- [ ] Log errors with `[MV Refresh]` prefix
- [ ] Don't throw exceptions on refresh error
- [ ] Test with admin user
- [ ] Test with non-admin user (should fail gracefully)
- [ ] Verify MVs update correctly after operations

## Future Enhancements

When `pg_cron` becomes available:

1. Create scheduled jobs to refresh MVs every 10 minutes
2. Remove RPC calls from repositories
3. Keep RPC functions for manual refresh capability

Until then, manual refresh via RPC is the correct approach.
