export default {
  providers: [
    {
      domain: process.env.CONVEX_SELF_HOSTED_URL || 'http://127.0.0.1:3210',
      applicationID: 'convex',
    },
  ],
};
