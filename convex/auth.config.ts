// Clerk JWT issuer domain — set CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard
// (Settings → Environment Variables). Format: https://<your-clerk-domain>.clerk.accounts.dev
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
