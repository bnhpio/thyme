import type { GenericActionCtx } from 'convex/server';
import { api, internal } from '../../_generated/api';
import type { DataModel, Id } from '../../_generated/dataModel';
import { httpAction } from '../../_generated/server';

function createJsonResponse(data: object, status = 200) {
  return new Response(JSON.stringify(data), { status });
}

async function extractUserIdFromRequest(
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

export const listOrganizations = httpAction(async (ctx, request) => {
  // Step 1: Authenticate and get userId
  const uIdOrError = await extractUserIdFromRequest(ctx, request);
  if ('error' in uIdOrError) return uIdOrError.error;
  const userId = uIdOrError.userId;
  const organizations = await ctx.runQuery(
    api.query.user.getUserOrganizations,
    { userId },
  );
  return createJsonResponse(
    {
      organizations: organizations.map((org) => ({
        id: org._id,
        name: org.name,
        slug: org.slug,
        role: org.role,
      })),
    },
    200,
  );
});
