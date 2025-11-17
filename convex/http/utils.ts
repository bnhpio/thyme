import type { GenericActionCtx } from 'convex/server';
import { internal } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';

export function createJsonResponse(data: object, status = 200) {
  return new Response(JSON.stringify(data), { status });
}

export async function extractUserIdFromRequest(
  ctx: GenericActionCtx<DataModel>,
  request: Request,
): Promise<{ userId: Id<'users'> } | { error: Response }> {
  const authorizationHeader = request.headers.get('Authorization');
  const token = authorizationHeader?.split(' ')[1];
  if (!token) {
    return {
      error: createJsonResponse({ error: 'Missing authorization token' }, 401),
    };
  }
  try {
    const tokenHash = await ctx.runAction(
      internal.action.node.customToken._hashToken,
      { token },
    );
    const userId = await ctx.runQuery(
      internal.query.customToken._getUserByCustomToken,
      { tokenHash },
    );
    if (!userId) {
      return {
        error: createJsonResponse(
          { error: 'Invalid authorization token' },
          401,
        ),
      } as { error: Response };
    }
    return { userId: userId };
  } catch {
    return {
      error: createJsonResponse(
        { error: 'Failed to get user by custom token' },
        401,
      ),
    };
  }
}
