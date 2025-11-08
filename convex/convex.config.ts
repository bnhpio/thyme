// convex/convex.config.ts

import crons from '@convex-dev/crons/convex.config';
import autumn from '@useautumn/convex/convex.config';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(crons);
app.use(autumn);

export default app;
