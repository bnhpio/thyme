import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";

const CONVEX_URL = (import.meta as { env?: { VITE_CONVEX_URL?: string } }).env
	?.VITE_CONVEX_URL;
if (!CONVEX_URL) {
	console.error("missing envar CONVEX_URL");
}
const convexQueryClient = CONVEX_URL ? new ConvexQueryClient(CONVEX_URL) : null;

export const getConvexQueryClient = () => convexQueryClient;

export default function AppConvexProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	if (!convexQueryClient) {
		return <>{children}</>;
	}

	return (
		<ConvexProvider client={convexQueryClient.convexClient}>
			{children}
		</ConvexProvider>
	);
}
