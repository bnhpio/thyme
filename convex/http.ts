import { httpRouter } from 'convex/server';

import { auth } from './auth';
import { uploadTask } from './http/task/upload';

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: '/api/task/upload',
  method: 'POST',
  handler: uploadTask,
});
export default http;
