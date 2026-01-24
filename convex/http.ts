import { httpRouter } from 'convex/server';

import { auth } from './auth';
import { verifyToken } from './http/auth/verify';
import { listOrganizations } from './http/organization/list';
import { uploadTask } from './http/task/upload';

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: '/api/auth/verify',
  method: 'GET',
  handler: verifyToken,
});

http.route({
  path: '/api/task/upload',
  method: 'POST',
  handler: uploadTask,
});

http.route({
  path: '/api/organization/list',
  method: 'GET',
  handler: listOrganizations,
});
export default http;
