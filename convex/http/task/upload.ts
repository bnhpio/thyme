import type { GenericActionCtx } from 'convex/server';
import { internal } from '../../_generated/api';
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
  console.log(authorizationHeader, 'authorizationHeader');
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

async function extractUploadData(
  request: Request,
): Promise<
  | { organizationId?: string; checkSum?: string; blob: Blob }
  | { error: Response }
> {
  const formData = await request.formData();

  const dataField = formData.get('data');
  if (!dataField || typeof dataField !== 'string') {
    return {
      error: createJsonResponse(
        { error: 'Missing or invalid data field' },
        400,
      ),
    };
  }

  let data: { organizationId?: string; checkSum?: string };
  try {
    data = JSON.parse(dataField);
  } catch {
    return {
      error: createJsonResponse({ error: 'Invalid JSON in data field' }, 400),
    };
  }

  const blobField = formData.get('blob');
  if (!blobField || !(blobField instanceof Blob)) {
    return {
      error: createJsonResponse(
        { error: 'Missing or invalid blob field' },
        400,
      ),
    };
  }

  return {
    organizationId: data.organizationId,
    checkSum: data.checkSum ?? '',
    blob: blobField as Blob,
  };
}

export const uploadTask = httpAction(async (ctx, request) => {
  // Step 1: Authenticate and get userId
  const uIdOrError = await extractUserIdFromRequest(ctx, request);
  if ('error' in uIdOrError) return uIdOrError.error;
  const userId = uIdOrError.userId;
  // Step 2: Extract and validate multipart body
  const uploadData = await extractUploadData(request);
  if ('error' in uploadData) return uploadData.error;
  const { organizationId, checkSum, blob } = uploadData;
  // Step 3: Store the blob
  let storageId: Id<'_storage'>;
  try {
    storageId = await ctx.storage.store(blob, { sha256: checkSum });
  } catch {
    return createJsonResponse({ error: 'Failed to store blob' }, 500);
  }
  // Step 4: Record the task in DB
  try {
    await ctx.runMutation(internal.mutation.task.createTask, {
      storageId,
      checkSum: checkSum ?? '',
      userId,
      organizationId: organizationId
        ? (organizationId as Id<'organizations'>)
        : undefined,
    });
  } catch (error) {
    console.error(error);
    return createJsonResponse({ error: 'Failed to save task' }, 401);
  }
  // Step 5: Return by CORS response
  return createJsonResponse({ success: true, hash: storageId }, 200);
});
