import { httpRouter } from "convex/server";

import { auth } from "./auth/auth";

const http = httpRouter();



auth.addHttpRoutes(http);

export default http;