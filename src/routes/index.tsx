import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery as useConvexQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const {
		data: apiData,
		isLoading: apiLoading,
		error: apiError,
	} = useQuery({
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

	const todos = useConvexQuery(api.todos.list, {});
	const todosLoading = todos === undefined;
	const addTodo = useMutation(api.todos.add);
	const toggleTodo = useMutation(api.todos.toggle);
	const removeTodo = useMutation(api.todos.remove);
	const [newTodoText, setNewTodoText] = useState("");

	const handleAddTodo = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newTodoText.trim()) {
			await addTodo({ text: newTodoText.trim() });
			setNewTodoText("");
		}
	};

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">
					TanStack Start Deployment Test
				</h1>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">API Endpoint Test</h2>
					{apiLoading && <p className="text-gray-600">Loading...</p>}
					{apiError && (
						<div className="text-red-600">
							<p>Error: {apiError.message}</p>
						</div>
					)}
					{apiData && (
						<div className="space-y-2">
							<p className="text-lg font-medium text-green-600">
								{apiData.message}
							</p>
							<p className="text-sm text-gray-500">Server: {apiData.server}</p>
							<p className="text-sm text-gray-500">
								Timestamp: {new Date(apiData.timestamp).toLocaleString()}
							</p>
							<p className="text-xs text-gray-400">Status: {apiData.status}</p>
						</div>
					)}
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Convex Database Test</h2>
					{todosLoading && <p className="text-gray-600">Loading todos...</p>}
					{!todosLoading && todos === undefined && (
						<div className="text-red-600">
							<p>Error: Unable to fetch todos</p>
							<p className="text-sm mt-2">
								Make sure VITE_CONVEX_URL is set and Convex is running.
							</p>
						</div>
					)}
					{todos && (
						<div className="space-y-4">
							<form onSubmit={handleAddTodo} className="flex gap-2">
								<input
									type="text"
									value={newTodoText}
									onChange={(e) => setNewTodoText(e.target.value)}
									placeholder="Add a new todo..."
									className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<button
									type="submit"
									className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									Add
								</button>
							</form>

							{todos.length === 0 ? (
								<p className="text-gray-500 italic text-center py-4">
									No todos yet. Add one above!
								</p>
							) : (
								<ul className="space-y-2">
									{todos.map((todo) => (
										<li
											key={todo._id}
											className={`p-3 rounded-lg border ${
												todo.completed
													? "bg-gray-100 dark:bg-gray-700"
													: "bg-white dark:bg-gray-800"
											}`}
										>
											<div className="flex items-center gap-3">
												<input
													type="checkbox"
													checked={todo.completed}
													onChange={() => toggleTodo({ id: todo._id })}
													className="cursor-pointer w-4 h-4"
												/>
												<span
													className={
														todo.completed
															? "line-through text-gray-500 flex-1"
															: "flex-1"
													}
												>
													{todo.text}
												</span>
												<button
													type="button"
													onClick={() => removeTodo({ id: todo._id })}
													className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
												>
													Delete
												</button>
											</div>
										</li>
									))}
								</ul>
							)}
							<p className="text-xs text-gray-400 mt-4">
								Total todos: {todos?.length || 0}
							</p>
						</div>
					)}
				</div>

				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						✅ If you can see the API response and Convex todos above, your
						TanStack Start deployment is working correctly!
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
