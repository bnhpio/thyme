import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/server-components")({
	loader: async () => {
		// This loader runs on the server during SSR
		const now = new Date();
		return {
			message: "This content was rendered on the server!",
			renderedAt: now.toISOString(),
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			nodeVersion:
				typeof process !== "undefined"
					? (process.versions?.node ?? "N/A")
					: "N/A",
			initialCount: Math.floor(Math.random() * 100),
		};
	},
	component: ServerComponentsPage,
});

function ServerComponentsPage() {
	// Get the data that was fetched and serialized by the loader
	const serverData = Route.useLoaderData();

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">
					React Server Components Test
				</h1>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">
						Server-Side Rendered Content
					</h2>
					<div className="space-y-3">
						<p className="text-lg">
							<span className="font-semibold">Message:</span>{" "}
							<span className="text-green-600">{serverData.message}</span>
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							<span className="font-semibold">Rendered at:</span>{" "}
							{serverData.renderedAt}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							<span className="font-semibold">Server timezone:</span>{" "}
							{serverData.timezone}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							<span className="font-semibold">Node version:</span>{" "}
							{serverData.nodeVersion}
						</p>
					</div>
				</div>

				<div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						✅ This page is rendered on the server using TanStack Start's
						loader. The data above was fetched during server-side rendering.
					</p>
				</div>

				<ClientComponent initialCount={serverData.initialCount} />

				<div className="text-center mt-6">
					<Link
						to="/"
						className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
					>
						← Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}

// Client component that can use hooks
function ClientComponent({ initialCount }: { initialCount: number }) {
	return (
		<div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
			<p className="text-sm text-gray-700 dark:text-gray-300">
				This is a client component that received initial data from the server:{" "}
				<span className="font-bold">{initialCount}</span>
			</p>
		</div>
	);
}
