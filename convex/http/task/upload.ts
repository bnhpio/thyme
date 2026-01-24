import { internal } from '../../_generated/api';
import type { Id } from '../../_generated/dataModel';
import { httpAction } from '../../_generated/server';
import { createJsonResponse, extractUserIdFromRequest } from '../utils';

async function extractUploadData(
  request: Request,
): Promise<
  | { organizationId?: string; checkSum?: string; schema?: string; blob: Blob }
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

  let data: { organizationId?: string; checkSum?: string; schema?: string };
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
    schema: data.schema,
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
  const { organizationId, checkSum, schema, blob } = uploadData;

  const hasWriteAccess = await ctx.runQuery(
    internal.query.organization.hasWriteAccessToOrganization,
    {
      organizationId: organizationId as Id<'organizations'>,
      userId,
    },
  );
  if (!hasWriteAccess) {
    return createJsonResponse(
      { error: 'User does not have write access to this organization' },
      401,
    );
  }
  // Step 3: Store the blob
  let storageId: Id<'_storage'>;
  try {
    // Don't pass sha256 option - let Convex compute it
    // The checkSum from client is just a simple hash, not a proper SHA-256
    storageId = await ctx.storage.store(blob);
  } catch {
    return createJsonResponse({ error: 'Failed to store blob' }, 500);
  }
  // Step 4: Record the task in DB
  let taskId: Id<'tasks'>;
  try {
    taskId = await ctx.runMutation(internal.mutation.task.createTask, {
      storageId,
      checkSum: checkSum ?? '',
      userId,
      organizationId: organizationId
        ? (organizationId as Id<'organizations'>)
        : undefined,
      schema: schema,
    });
  } catch (error) {
    console.error(error);
    return createJsonResponse({ error: 'Failed to save task' }, 401);
  }
  // Step 5: Return by CORS response
  return createJsonResponse({ success: true, taskId: taskId }, 200);
});
