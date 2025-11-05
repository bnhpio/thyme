import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/hello")({
	server: {
		handlers: {
			GET: async () => {
				return json({
					message: "Hello from TanStack Start API!",
					timestamp: new Date().toISOString(),
					server: "TanStack Start + Nitro",
					status: "success",
				});
			},
		},
	},
});
