const baseUrl = (process.env.SMOKE_BASE_URL ?? "http://localhost:3001").replace(/\/$/, "");
const sessionCookie = process.env.SMOKE_SESSION_COOKIE ?? "";

const assertStatus = async (path, expectedStatuses, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    headers: sessionCookie ? { Cookie: `${process.env.SESSION_COOKIE_NAME ?? "devinsights.sid"}=${sessionCookie}` } : {},
    ...options
  });

  if (!expectedStatuses.includes(response.status)) {
    const body = await response.text();
    throw new Error(`${path} expected [${expectedStatuses.join(", ")}] but got ${response.status} (${body.slice(0, 300)})`);
  }

  return response;
};

const run = async () => {
  await assertStatus("/health", [200]);
  await assertStatus("/ready", [200]);
  await assertStatus("/api/v1/auth/github/login", [302]);

  if (sessionCookie) {
    await assertStatus("/api/v1/app/bootstrap", [200]);
    await assertStatus("/api/v1/integrations/github/status", [200]);
    await assertStatus("/api/v1/onboarding/status", [200]);
    await assertStatus("/api/v1/integrations/github/sync-progress", [200]);
    await assertStatus("/api/v1/dashboard/overview", [200]);
    await assertStatus("/api/v1/dashboard/pull-requests?period=30d&state=all", [200]);
    await assertStatus("/api/v1/dashboard/dora-overview", [200]);
  }

  process.stdout.write("Smoke E2E checks passed.\n");
};

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
