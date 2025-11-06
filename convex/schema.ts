import { defineSchema } from 'convex/server'
import { authTables } from "@convex-dev/auth/server";
import { organizationSchema } from './schemas/organization';
import userSettingsTable from './schemas/user/userSettings';

  export default defineSchema({
  ...authTables,
  	userSettings: userSettingsTable,
...organizationSchema,

});
