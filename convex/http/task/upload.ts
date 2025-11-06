import { internal } from '../../_generated/api';
import type { Id } from '../../_generated/dataModel';
import { httpAction } from '../../_generated/server';

export const uploadTask = httpAction(async (ctx, request) => {
  const authorizationToken = request.headers.get('Authorization');
  console.log(authorizationToken);
  const token = authorizationToken?.split(' ')[1];
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization token' }),
      { status: 401 },
    );
  }
  let userId: Id<'users'> | undefined;
  try {
    userId = await ctx.runQuery(
      internal.query.customToken._getUserByCustomToken,
      {
        tokenHash: token,
      },
    );
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401 },
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to get user by custom token' }),
      { status: 401 },
    );
  }
  // Step 1: Parse FormData
  const formData = await request.formData();

  // Step 2: Extract organizationId from the 'data' field
  const dataField = formData.get('data');
  if (!dataField || typeof dataField !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid data field' }),
      { status: 400 },
    );
  }

  let organizationId: string | undefined;
  let checkSum: string | undefined;
  try {
    const data = JSON.parse(dataField) as {
      organizationId?: string;
      checkSum?: string;
    };
    organizationId = data.organizationId;
    checkSum = data.checkSum ?? '';
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in data field' }),
      { status: 400 },
    );
  }

  // Step 3: Extract blob from the 'blob' field
  const blobField = formData.get('blob');
  if (!blobField || !(blobField instanceof Blob)) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid blob field' }),
      { status: 400 },
    );
  }

  // Step 4: Store the blob
  const storageId = await ctx.storage.store(blobField, {
    sha256: checkSum,
  });
  try {
    await ctx.runMutation(internal.mutation.task.createTask, {
      storageId,
      checkSum,
      userId,
      organizationId: organizationId
        ? (organizationId as Id<'organizations'>)
        : undefined,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to save task' }), {
      status: 401,
    });
  }
  // Step 5: Save the storage ID and organizationId to the database via a mutation

  // Step 6: Return a response with the correct CORS headers
  return new Response(JSON.stringify({ success: true, hash: storageId }), {
    status: 200,
  });
});
