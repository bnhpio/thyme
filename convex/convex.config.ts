// convex/convex.config.ts

import crons from '@convex-dev/crons/convex.config';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(crons);

export default app;
