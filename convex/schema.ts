import { authTables } from '@convex-dev/auth/server';
import { defineSchema } from 'convex/server';
import { chainSchema } from './schemas/chain';
import { organizationSchema } from './schemas/organization';
import { platformSchema } from './schemas/platform';
import { profileSchema } from './schemas/profile';
import { taskSchema } from './schemas/task';
import userCustomTokensTable from './schemas/user/userCustomToken';
import userSettingsTable from './schemas/user/userSettings';

export default defineSchema({
  ...authTables,
  userSettings: userSettingsTable,
  userCustomTokens: userCustomTokensTable,
  ...organizationSchema,
  ...taskSchema,
  ...profileSchema,
  ...chainSchema,
  ...platformSchema,
});
