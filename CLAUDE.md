# CLAUDE.md

## Project Overview

Thyme is a full-stack Web3 automation platform built with TanStack Start (React 19 + Vite + Nitro SSR), Convex backend, and Tailwind CSS 4. Users can create, schedule, and execute Web3 functions on blockchain networks without managing infrastructure.

**Tech Stack:**
- Frontend: TanStack Router + React Start, React 19, Tailwind CSS 4, Shadcn UI
- Backend: Convex (serverless functions, real-time database, auth, cron)
- Web3: Alchemy Account Kit (smart accounts, gas sponsorship), Viem
- Billing: Autumn JS
- Auth: Convex Auth with GitHub OAuth

## Quick Reference

- **Dev**: `bun run dev` - Start dev server on port 3000
- **Build**: `bun run build` - Production build via Vite
- **Test**: `bun run test` - Run Vitest tests
- **Lint**: `bun run lint` - Biome linter
- **Format**: `bun run format` - Biome formatter
- **Check**: `bun run check` - Format + lint with auto-fix

Package manager is **Bun**. Node.js v22+ required.

## Key Directories

```
src/
├── routes/              # TanStack Router file-based routing
│   ├── __root.tsx       # Root layout with SSR setup
│   ├── _authed.tsx      # Protected routes wrapper (auth guard)
│   ├── _authed/         # Authenticated route children
│   └── auth/            # Login, callback flows
├── components/
│   ├── ui/              # Shadcn UI primitives (do not modify directly)
│   └── base/            # Core app components (Logo, NotFound)
├── pages/               # Complex page layouts and business logic
├── layouts/             # App layouts (DashboardLayout, AppSidebar)
├── hooks/               # Custom React hooks
├── lib/
│   ├── tanstack-auth/   # Custom Convex Auth integration for TanStack
│   ├── autumn/          # Billing helpers
│   ├── chains.ts        # Blockchain network configs
│   └── utils.ts         # Error handling & utilities
├── integrations/        # Third-party client setup (Convex, React Query)
├── serverFn/            # TanStack Start server functions
└── assets/              # Images, logos

convex/
├── action/              # Convex actions (Node.js runtime, side effects)
├── mutation/            # Database write operations
├── query/               # Database read operations
├── schemas/             # Database table definitions
├── http/                # HTTP API routes
├── auth.ts              # Convex Auth configuration
├── schema.ts            # Master schema export
└── _generated/          # Auto-generated types (never modify)
```

## Code Standards

### TypeScript
- Strict mode enabled
- Use path alias `@/` for all imports from `src/`
- Convex functions use generated types from `convex/_generated/`

### React & Components
- Server components by default in routes
- Client components only when hooks/interactivity needed
- Use Shadcn UI components from `@/components/ui/`
- Component variants use `class-variance-authority` (CVA)
- Class merging via `cn()` utility from `@/lib/utils`

### TanStack Router Patterns
```tsx
// Route definition
export const Route = createFileRoute('/_authed/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => { /* auth checks */ },
  loader: async () => { /* data fetching */ },
});
```

### Convex Patterns
```tsx
// Query (convex/query/*.ts)
export const getData = query({
  args: { id: v.id('tableName') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation (convex/mutation/*.ts)
export const updateData = mutation({
  args: { id: v.id('tableName'), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { name: args.name });
  },
});

// Frontend usage
const data = useQuery(api.query.module.getData, { id });
const update = useMutation(api.mutation.module.updateData);
```

### Server Functions (TanStack Start)
```tsx
// src/serverFn/*.ts - runs on server only
export const getServerData = createServerFn().handler(async () => {
  const client = await getServerConvexClient();
  return await client.query(api.query.user.getCurrentUser);
});
```

### Styling
- Tailwind CSS v4 with CSS custom properties for theming
- Dark mode is default (`class="dark"` on HTML)
- Theme stored in user settings and persisted to database
- Mobile-first responsive design

**IMPORTANT CSS Rules:**
- **Only use theme variables** - Use `text-foreground`, `bg-background`, `text-success`, `border-border`, etc.
- **Never use Tailwind default colors** - No `text-white`, `bg-gray-500`, `text-blue-600`, etc.
- **No inline styles** - Never use `style={{ }}` attributes

```tsx
// CORRECT
<div className="bg-background text-foreground border-border">
<span className="text-muted-foreground">
<button className="bg-primary text-primary-foreground">

// WRONG - Never do this
<div className="bg-white text-gray-900">
<span className="text-slate-500">
<div style={{ color: 'red' }}>
```

### Imports Order
1. External packages
2. Internal (`@/` aliases)
3. Relative imports
4. Type imports

## Self-Verification Workflow

1. Write code changes
2. Run `bun run check` - fixes formatting and linting
3. Run `bun run build` - verify no TypeScript/build errors
4. Test in dev server: `bun run dev`
5. Only then present the changes

## Authentication

Custom Convex Auth integration with TanStack Start:

- **Provider**: `ConvexAuthTanstackProvider` in `src/lib/tanstack-auth/`
- **Hooks**: `useAuth()`, `useAuthActions()`, `useIsAuthenticated()`
- **Server**: `getAuthState()` reads token from httpOnly cookie
- **Protected routes**: Use `_authed.tsx` layout wrapper
- **OAuth**: GitHub provider configured in `convex/auth.ts`

Auth checks in routes:
```tsx
// In route beforeLoad
const authState = await getAuthState();
if (!authState.isAuthenticated) {
  throw redirect({ to: '/auth/login' });
}
```

## Database

### Key Tables
- `organizations` - Workspaces (name, slug, settings)
- `organizationMembers` - Team membership (userId, role: admin/member/viewer)
- `organizationInvites` - Pending invites (email, token, expiresAt)
- `userSettings` - User preferences (currentOrganizationId, theme)
- `executables` - Scheduled automations (taskId, trigger, chain, status)
- `profiles` - Wallet profiles (alias, address, chain)

### Query Patterns
```tsx
// Use indexes for efficient queries
const members = await ctx.db
  .query('organizationMembers')
  .withIndex('by_organization', q => q.eq('organizationId', orgId))
  .filter(q => q.eq(q.field('status'), 'active'))
  .collect();
```

## Gotchas

### Never Modify
- `convex/_generated/` - Auto-generated Convex types
- `src/routeTree.gen.ts` - Auto-generated route tree
- `src/components/ui/` - Shadcn components (use CLI to update)

### Authentication
- Token refresh happens server-side only (security)
- httpOnly cookies store JWT tokens (not accessible to JS)
- Custom auth wrapper in `src/lib/tanstack-auth/` - understand before modifying

### Convex
- Actions run in Node.js runtime, queries/mutations in V8 isolate
- Use `v.*` validators from `convex/values` for args
- Real-time subscriptions are automatic with `useQuery`

### Error Handling
- Use `getErrorMessage()` from `@/lib/utils` for user-friendly errors
- Strips Convex technical prefixes and request IDs

### Organization Context
- User must have `currentOrganizationId` set in `userSettings`
- Organization ID is also used as Autumn customer ID for billing
- Check membership before allowing organization operations

### File-Based Routing
- Files in `src/routes/` become routes automatically
- `_authed.tsx` wraps protected routes (underscore prefix = layout)
- `__root.tsx` is the root layout
- Route params: `$paramName` in filename

## Environment Variables

Required for local development:
```
VITE_CONVEX_URL=http://127.0.0.1:3210  # Local Convex
# Or production Convex URL

# OAuth (in Convex dashboard)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (Brevo SMTP)
BREVO_EMAIL=...
BREVO_SMTP_KEY=...

# Site URL for invite links
SITE_URL=...
```

## Deployment

- **Platform**: Netlify
- **Build**: `vite build`
- **Output**: `dist/client`
- **SSR**: Enabled via Nitro
