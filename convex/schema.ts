import { authTables } from '@convex-dev/auth/server';
import { defineSchema } from 'convex/server';
import { organizationSchema } from './schemas/organization';
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
});
