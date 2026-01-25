# Root Admin Architecture Plan

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLATFORM LEVEL                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     ROOT ADMIN                              ││
│  │  • Env var: ROOT_ADMIN_EMAILS="admin@x.com,backup@x.com"   ││
│  │  • Route: /_root-admin/*                                    ││
│  │  • Can also use app as regular user (org member)           ││
│  │  • Post-login prompt: "Go to Dashboard" or "Root Admin"    ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│         ┌────────────────────┼────────────────────┐            │
│         ▼                    ▼                    ▼            │
│  ┌─────────────┐     ┌─────────────┐      ┌─────────────┐     │
│  │ globalChains│     │platformConfig│      │ featureFlags│     │
│  └─────────────┘     └─────────────┘      └─────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Organization A │  │  Organization B │  │  Organization C │
│  (root admin    │  │                 │  │                 │
│   can join too) │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 1. Database Schema Changes

### New Tables

```typescript
// convex/schemas/platform/globalChain.ts
globalChains: defineTable({
  chainId: v.number(),
  name: v.string(),
  rpcUrls: v.array(v.string()),
  explorerUrl: v.optional(v.string()),
  nativeCurrency: v.object({
    name: v.string(),
    symbol: v.string(),
    decimals: v.number(),
  }),
  isTestnet: v.boolean(),
  isEnabled: v.boolean(),
  priority: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index('by_chain_id', ['chainId'])
  .index('by_enabled', ['isEnabled'])

// convex/schemas/platform/organizationChain.ts
organizationChains: defineTable({
  organizationId: v.id('organizations'),
  chainId: v.number(),
  rpcUrls: v.array(v.string()),
  isEnabled: v.boolean(),
  priority: v.optional(v.number()),
}).index('by_organization', ['organizationId'])
  .index('by_org_chain', ['organizationId', 'chainId'])

// convex/schemas/platform/platformConfig.ts
platformConfig: defineTable({
  key: v.string(),
  value: v.string(),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id('users')),
}).index('by_key', ['key'])

// convex/schemas/platform/featureFlag.ts
featureFlags: defineTable({
  key: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  defaultValue: v.string(),
  valueType: v.union(
    v.literal('boolean'),
    v.literal('number'),
    v.literal('string')
  ),
  isEnabled: v.boolean(),
  createdAt: v.number(),
}).index('by_key', ['key'])

// convex/schemas/platform/organizationFeatureOverride.ts
organizationFeatureOverrides: defineTable({
  organizationId: v.id('organizations'),
  featureFlagId: v.id('featureFlags'),
  value: v.string(),
  updatedAt: v.number(),
  updatedBy: v.id('users'),
}).index('by_organization', ['organizationId'])
  .index('by_flag', ['featureFlagId'])
```

### Modify Existing

```typescript
// Add to organizations table
organizations: defineTable({
  // ...existing fields
  status: v.union(
    v.literal('active'),
    v.literal('suspended'),
    v.literal('deleted')
  ),
  suspendedAt: v.optional(v.number()),
  suspendedBy: v.optional(v.id('users')),
  suspendReason: v.optional(v.string()),
})
```

---

## 2. Authorization Layer

```typescript
// convex/lib/rootAdmin.ts
import { QueryCtx, MutationCtx } from '../_generated/server';

const ROOT_ADMIN_EMAILS = (process.env.ROOT_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export async function isRootAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>
): Promise<boolean> {
  const user = await ctx.db.get(userId);
  if (!user?.email) return false;
  return ROOT_ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export async function requireRootAdmin(
  ctx: MutationCtx,
  userId: Id<'users'>
): Promise<void> {
  if (!await isRootAdmin(ctx, userId)) {
    throw new Error('Root admin access required');
  }
}

// Query for client-side checks
export const getRootAdminStatus = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { isRootAdmin: false };
    return { isRootAdmin: await isRootAdmin(ctx, userId) };
  },
});
```

---

## 3. Post-Login Flow (Dual-Mode Access)

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Sign In    │────▶│  Is Root Admin?     │────▶│  Regular User    │
│              │     │                     │ No  │  → /dashboard    │
└──────────────┘     └─────────────────────┘     └──────────────────┘
                              │ Yes
                              ▼
                     ┌─────────────────────┐
                     │   Role Selector     │
                     │   ┌───────────────┐ │
                     │   │  Dashboard    │ │  → /_authed/dashboard
                     │   └───────────────┘ │
                     │   ┌───────────────┐ │
                     │   │  Root Admin   │ │  → /_root-admin
                     │   └───────────────┘ │
                     └─────────────────────┘
```

### Implementation

```typescript
// src/routes/auth/callback.tsx (modify existing)
// After successful auth, redirect to role-selector if root admin

export const Route = createFileRoute('/auth/callback')({
  loader: async () => {
    // ... existing token exchange logic

    // Check if user is root admin
    const { isRootAdmin } = await convexQuery(api.query.rootAdmin.getStatus);

    if (isRootAdmin) {
      throw redirect({ to: '/role-selector' });
    }

    // Regular user flow
    throw redirect({ to: '/dashboard' });
  },
});

// src/routes/role-selector.tsx (NEW)
export const Route = createFileRoute('/role-selector')({
  component: RoleSelectorPage,
  beforeLoad: async () => {
    const { isAuthenticated } = await import('@/lib/tanstack-auth/server');
    if (!await isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

function RoleSelectorPage() {
  const navigate = useNavigate();
  const { isRootAdmin } = useRootAdminStatus();

  // If not root admin, redirect to dashboard
  if (!isRootAdmin) {
    navigate({ to: '/dashboard' });
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Choose where to go</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="h-20 justify-start gap-4"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <LayoutDashboard className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Dashboard</div>
              <div className="text-sm text-muted-foreground">
                Continue as regular user
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-20 justify-start gap-4"
            onClick={() => navigate({ to: '/_root-admin' })}
          >
            <Shield className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Root Admin Panel</div>
              <div className="text-sm text-muted-foreground">
                Manage platform settings
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 4. Route Structure

```
src/routes/
├── role-selector.tsx             # Post-login choice for root admins
├── _root-admin.tsx               # Layout with root admin guard
├── _root-admin/
│   ├── index.tsx                 # Dashboard overview & stats
│   ├── chains.tsx                # Global chain management
│   ├── users.tsx                 # All users list
│   ├── users.$userId.tsx         # User detail/management
│   ├── organizations.tsx         # All orgs list
│   ├── organizations.$orgId.tsx  # Org detail (suspend/delete)
│   ├── feature-flags.tsx         # Feature flag management
│   └── settings.tsx              # Platform settings
```

### Route Guard

```typescript
// src/routes/_root-admin.tsx
export const Route = createFileRoute('/_root-admin')({
  component: RootAdminLayout,
  beforeLoad: async () => {
    const { isAuthenticated } = await import('@/lib/tanstack-auth/server');
    if (!await isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

function RootAdminLayout() {
  const { isRootAdmin, isLoading } = useRootAdminStatus();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;
  if (!isRootAdmin) {
    navigate({ to: '/dashboard' });
    return null;
  }

  return (
    <div className="flex h-screen">
      <RootAdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## 5. Navigation: Switch Between Modes

Root admin can switch between regular dashboard and root admin panel anytime:

```typescript
// In regular dashboard header (for root admins only)
function DashboardHeader() {
  const { isRootAdmin } = useRootAdminStatus();

  return (
    <header>
      {/* ...existing content */}

      {isRootAdmin && (
        <Button variant="ghost" asChild>
          <Link to="/_root-admin">
            <Shield className="mr-2 h-4 w-4" />
            Root Admin
          </Link>
        </Button>
      )}
    </header>
  );
}

// In root admin sidebar
function RootAdminSidebar() {
  return (
    <aside>
      {/* ...admin nav items */}

      <div className="mt-auto border-t pt-4">
        <Button variant="ghost" asChild className="w-full justify-start">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </aside>
  );
}
```

---

## 6. API Structure

```
convex/
├── lib/
│   └── rootAdmin.ts              # isRootAdmin, requireRootAdmin helpers
│
├── query/
│   ├── rootAdmin.ts              # getStatus (client check)
│   └── rootAdmin/
│       ├── chains.ts             # listGlobalChains, getChainById
│       ├── users.ts              # listAllUsers, getUserDetails
│       ├── organizations.ts      # listAllOrganizations, getOrgDetails
│       ├── featureFlags.ts       # listFeatureFlags
│       └── platform.ts           # getPlatformConfig, getStats
│
├── mutation/
│   └── rootAdmin/
│       ├── chains.ts             # createChain, updateChain, deleteChain
│       ├── users.ts              # suspendUser, unsuspendUser
│       ├── organizations.ts      # suspendOrg, unsuspendOrg, deleteOrg
│       ├── featureFlags.ts       # createFlag, updateFlag, setOrgOverride
│       └── platform.ts           # updatePlatformConfig
```

---

## 7. Chain Resolution (Hybrid Model)

```typescript
// convex/lib/chains.ts
export async function getEffectiveChains(
  ctx: QueryCtx,
  organizationId?: Id<'organizations'>
): Promise<Chain[]> {
  const globalChains = await ctx.db
    .query('globalChains')
    .withIndex('by_enabled', q => q.eq('isEnabled', true))
    .collect();

  if (!organizationId) {
    return globalChains.sort((a, b) => a.priority - b.priority);
  }

  const orgOverrides = await ctx.db
    .query('organizationChains')
    .withIndex('by_organization', q => q.eq('organizationId', organizationId))
    .collect();

  const overrideMap = new Map(orgOverrides.map(o => [o.chainId, o]));

  return globalChains
    .map(global => {
      const override = overrideMap.get(global.chainId);
      if (!override) return global;
      if (!override.isEnabled) return null;

      return {
        ...global,
        rpcUrls: override.rpcUrls.length > 0 ? override.rpcUrls : global.rpcUrls,
        priority: override.priority ?? global.priority,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);
}
```

---

## 8. Self-Hosting Configuration

### Environment Variables

```bash
# Required
ROOT_ADMIN_EMAILS=admin@company.com,backup@company.com
SITE_URL=https://your-instance.com

# Optional
ALLOW_PUBLIC_SIGNUPS=true
DEFAULT_CHAINS_PRESET=mainnet  # mainnet | testnet | all
```

### First-Run Behavior

- App works normally for all users
- Users with email in `ROOT_ADMIN_EMAILS` see role selector after login
- No special setup wizard needed

---

## 9. Implementation Phases

| Phase | Scope |
|-------|-------|
| **Phase 1** | Schema (`globalChains`, `platformConfig`), `rootAdmin.ts` helper, `/_root-admin` route guard |
| **Phase 2** | `/role-selector` page, post-login redirect logic, mode switching in headers |
| **Phase 3** | Global chains CRUD + UI, migrate existing `chains` table data |
| **Phase 4** | Org management (add `status` field, suspend/unsuspend, list all orgs) |
| **Phase 5** | User management (list all users, suspend/unsuspend) |
| **Phase 6** | Feature flags schema + management UI |
| **Phase 7** | Platform settings, dashboard stats, polish |

---

## 10. UI Components

```
src/components/root-admin/
├── RootAdminSidebar.tsx
├── RootAdminHeader.tsx
├── ChainForm.tsx
├── ChainList.tsx
├── UserTable.tsx
├── OrganizationTable.tsx
├── FeatureFlagEditor.tsx
├── PlatformStats.tsx
├── SuspendDialog.tsx
└── RoleSelectorCard.tsx
```
