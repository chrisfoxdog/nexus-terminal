export default async function handler(_req: any, res: any) {
  const steps: string[] = [];
  const envInfo: Record<string, unknown> = {};
  const du = process.env.DATABASE_URL || "";
  envInfo.database_url_set = Boolean(du);
  envInfo.database_url_length = du.length;
  envInfo.database_url_starts_with_postgres = du.startsWith("postgres://") || du.startsWith("postgresql://");
  envInfo.database_url_has_name_prefix = du.includes("=") && du.indexOf("=") < (du.indexOf("://") === -1 ? 0 : du.indexOf("://"));
  envInfo.whop_api_key_set = Boolean(process.env.WHOP_API_KEY);
  envInfo.gemini_key_set = Boolean(process.env.GEMINI_API_KEY);
  envInfo.node_env = process.env.NODE_ENV || null;

  const probe = async (label: string, spec: string) => {
    try {
      await import(spec);
      steps.push(label + " ok");
    } catch (e: any) {
      const detail = String((e && (e.stack || e.message)) || e).split("\n").slice(0, 4).join(" | ");
      steps.push(label + " FAIL: " + detail);
    }
  };

  await probe("express", "express");
  await probe("server_db", "../server_db");
  await probe("server_whop_auth", "../server_whop_auth");
  await probe("server", "../server");

  res.status(200).json({ envInfo, steps });
}
