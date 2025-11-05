import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["hello"],
		queryFn: async () => {
			const response = await fetch("/api/hello");
			if (!response.ok) {
				throw new Error("Failed to fetch");
			}
			return response.json() as Promise<{
				message: string;
				timestamp: string;
				server: string;
				status: string;
			}>;
		},
	});

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">TanStack Start Deployment Test</h1>
				
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">API Endpoint Test</h2>
					{isLoading && <p className="text-gray-600">Loading...</p>}
					{error && (
						<div className="text-red-600">
							<p>Error: {error.message}</p>
						</div>
					)}
					{data && (
						<div className="space-y-2">
							<p className="text-lg font-medium text-green-600">{data.message}</p>
							<p className="text-sm text-gray-500">Server: {data.server}</p>
							<p className="text-sm text-gray-500">Timestamp: {new Date(data.timestamp).toLocaleString()}</p>
							<p className="text-xs text-gray-400">Status: {data.status}</p>
						</div>
					)}
				</div>

				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						✅ If you can see the API response above, your TanStack Start deployment is working correctly!
					</p>
				</div>

				<div className="text-center">
					<Link
						to="/server-components"
						className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Test React Server Components →
					</Link>
				</div>
			</div>
		</div>
	);
}
