import { Pool } from "pg";

export interface StoredPass {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  creatorName: string;
  icon: string;
  coverImage: string;
  licenseKey: string;
  status: "active" | "expired" | "canceled";
  planName: string;
  pricePaid: number;
  createdAt: string;
  expiresAt: string;
  discordConnected: boolean;
  appType: string;
  isTrialActive?: boolean;
  whopMembershipId?: string;
  verifiedOnWhop?: boolean;
}

export interface StoredReview {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
}

export interface StoredWebhookLog {
  id: string;
  action: string;
  timestamp: string;
  payload: any;
  status:
    | "PROCESSED_SUCCESS"
    | "SIGNATURE_VERIFIED"
    | "SIGNATURE_FAILED"
    | "DUPLICATE_IGNORED";
  signatureValid: boolean;
}

export interface WhopDataStore {
  passes: StoredPass[];
  reviews: Record<string, StoredReview[]>;
  webhookLogs: StoredWebhookLog[];
  processedEventIds: string[];
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "[Whop DB] DATABASE_URL is not configured. Database operations will fail until PostgreSQL is configured."
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

let schemaPromise: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!schemaPromise) {
    schemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS nexus_passes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL DEFAULT '',
          product_title TEXT NOT NULL DEFAULT '',
          creator_name TEXT NOT NULL DEFAULT '',
          icon TEXT NOT NULL DEFAULT '',
          cover_image TEXT NOT NULL DEFAULT '',
          license_key TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'canceled')),
          plan_name TEXT NOT NULL DEFAULT '',
          price_paid NUMERIC NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL,
          expires_at TIMESTAMPTZ NULL,
          discord_connected BOOLEAN NOT NULL DEFAULT FALSE,
          app_type TEXT NOT NULL DEFAULT 'signals',
          is_trial_active BOOLEAN,
          whop_membership_id TEXT,
          verified_on_whop BOOLEAN NOT NULL DEFAULT FALSE
        );

        CREATE INDEX IF NOT EXISTS idx_nexus_passes_user_id
          ON nexus_passes(user_id);

        CREATE INDEX IF NOT EXISTS idx_nexus_passes_membership
          ON nexus_passes(whop_membership_id);

        CREATE INDEX IF NOT EXISTS idx_nexus_passes_license
          ON nexus_passes(license_key)
          WHERE license_key <> '';

        CREATE TABLE IF NOT EXISTS nexus_reviews (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          user_name TEXT NOT NULL DEFAULT '',
          user_avatar TEXT NOT NULL DEFAULT '',
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL DEFAULT '',
          review_date TIMESTAMPTZ NOT NULL,
          verified_buyer BOOLEAN NOT NULL DEFAULT FALSE
        );

        CREATE INDEX IF NOT EXISTS idx_nexus_reviews_product_id
          ON nexus_reviews(product_id);

        CREATE TABLE IF NOT EXISTS nexus_webhook_logs (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          status TEXT NOT NULL,
          signature_valid BOOLEAN NOT NULL DEFAULT FALSE
        );

        CREATE INDEX IF NOT EXISTS idx_nexus_webhook_logs_timestamp
          ON nexus_webhook_logs(timestamp DESC);

        CREATE TABLE IF NOT EXISTS nexus_processed_events (
          event_id TEXT PRIMARY KEY,
          processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_nexus_processed_events_processed_at
          ON nexus_processed_events(processed_at DESC);
      `);

      console.log("[Whop DB] PostgreSQL schema ready.");
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
}

export async function loadStore(): Promise<WhopDataStore> {
  await ensureSchema();

  const [passesResult, reviewsResult, logsResult, eventsResult] =
    await Promise.all([
      pool.query(`
        SELECT
          id,
          user_id,
          product_id,
          product_title,
          creator_name,
          icon,
          cover_image,
          license_key,
          status,
          plan_name,
          price_paid,
          created_at,
          expires_at,
          discord_connected,
          app_type,
          is_trial_active,
          whop_membership_id,
          verified_on_whop
        FROM nexus_passes
        ORDER BY created_at DESC
      `),
      pool.query(`
        SELECT
          id,
          product_id,
          user_name,
          user_avatar,
          rating,
          comment,
          review_date,
          verified_buyer
        FROM nexus_reviews
        ORDER BY review_date DESC
      `),
      pool.query(`
        SELECT
          id,
          action,
          timestamp,
          payload,
          status,
          signature_valid
        FROM nexus_webhook_logs
        ORDER BY timestamp DESC
        LIMIT 100
      `),
      pool.query(`
        SELECT event_id
        FROM nexus_processed_events
        ORDER BY processed_at DESC
        LIMIT 500
      `),
    ]);

  const passes: StoredPass[] = passesResult.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productTitle: row.product_title,
    creatorName: row.creator_name,
    icon: row.icon,
    coverImage: row.cover_image,
    licenseKey: row.license_key,
    status: row.status,
    planName: row.plan_name,
    pricePaid: Number(row.price_paid),
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: row.expires_at
      ? new Date(row.expires_at).toISOString()
      : "",
    discordConnected: Boolean(row.discord_connected),
    appType: row.app_type,
    ...(row.is_trial_active !== null
      ? { isTrialActive: Boolean(row.is_trial_active) }
      : {}),
    ...(row.whop_membership_id
      ? { whopMembershipId: row.whop_membership_id }
      : {}),
    verifiedOnWhop: Boolean(row.verified_on_whop),
  }));

  const reviews: Record<string, StoredReview[]> = {};

  for (const row of reviewsResult.rows) {
    if (!reviews[row.product_id]) {
      reviews[row.product_id] = [];
    }

    reviews[row.product_id].push({
      id: row.id,
      productId: row.product_id,
      userName: row.user_name,
      userAvatar: row.user_avatar,
      rating: Number(row.rating),
      comment: row.comment,
      date: new Date(row.review_date).toISOString(),
      verifiedBuyer: Boolean(row.verified_buyer),
    });
  }

  const webhookLogs: StoredWebhookLog[] = logsResult.rows.map((row) => ({
    id: row.id,
    action: row.action,
    timestamp: new Date(row.timestamp).toISOString(),
    payload: row.payload,
    status: row.status,
    signatureValid: Boolean(row.signature_valid),
  }));

  return {
    passes,
    reviews,
    webhookLogs,
    processedEventIds: eventsResult.rows.map((row) => row.event_id),
  };
}

export async function saveStore(_store: WhopDataStore): Promise<void> {
  await ensureSchema();
}

export async function getPassesForUser(userId: string): Promise<StoredPass[]> {
  await ensureSchema();

  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        product_id,
        product_title,
        creator_name,
        icon,
        cover_image,
        license_key,
        status,
        plan_name,
        price_paid,
        created_at,
        expires_at,
        discord_connected,
        app_type,
        is_trial_active,
        whop_membership_id,
        verified_on_whop
      FROM nexus_passes
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productTitle: row.product_title,
    creatorName: row.creator_name,
    icon: row.icon,
    coverImage: row.cover_image,
    licenseKey: row.license_key,
    status: row.status,
    planName: row.plan_name,
    pricePaid: Number(row.price_paid),
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: row.expires_at
      ? new Date(row.expires_at).toISOString()
      : "",
    discordConnected: Boolean(row.discord_connected),
    appType: row.app_type,
    ...(row.is_trial_active !== null
      ? { isTrialActive: Boolean(row.is_trial_active) }
      : {}),
    ...(row.whop_membership_id
      ? { whopMembershipId: row.whop_membership_id }
      : {}),
    verifiedOnWhop: Boolean(row.verified_on_whop),
  }));
}

export async function savePass(pass: StoredPass): Promise<StoredPass> {
  await ensureSchema();

  const existingResult = await pool.query(
    `
      SELECT id
      FROM nexus_passes
      WHERE id = $1
         OR ($2 <> '' AND license_key = $2)
         OR ($3 <> '' AND whop_membership_id = $3)
      LIMIT 1
    `,
    [pass.id, pass.licenseKey || "", pass.whopMembershipId || ""]
  );

  const existingId = existingResult.rows[0]?.id;

  if (existingId) {
    await pool.query(
      `
        UPDATE nexus_passes
        SET
          user_id = $1,
          product_id = $2,
          product_title = $3,
          creator_name = $4,
          icon = $5,
          cover_image = $6,
          license_key = $7,
          status = $8,
          plan_name = $9,
          price_paid = $10,
          created_at = $11,
          expires_at = $12,
          discord_connected = $13,
          app_type = $14,
          is_trial_active = $15,
          whop_membership_id = $16,
          verified_on_whop = $17
        WHERE id = $18
      `,
      [
        pass.userId,
        pass.productId,
        pass.productTitle,
        pass.creatorName,
        pass.icon,
        pass.coverImage,
        pass.licenseKey || "",
        pass.status,
        pass.planName,
        pass.pricePaid,
        pass.createdAt,
        pass.expiresAt || null,
        pass.discordConnected,
        pass.appType,
        pass.isTrialActive ?? null,
        pass.whopMembershipId || null,
        pass.verifiedOnWhop ?? false,
        existingId,
      ]
    );
  } else {
    await pool.query(
      `
        INSERT INTO nexus_passes (
          id,
          user_id,
          product_id,
          product_title,
          creator_name,
          icon,
          cover_image,
          license_key,
          status,
          plan_name,
          price_paid,
          created_at,
          expires_at,
          discord_connected,
          app_type,
          is_trial_active,
          whop_membership_id,
          verified_on_whop
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18
        )
      `,
      [
        pass.id,
        pass.userId,
        pass.productId,
        pass.productTitle,
        pass.creatorName,
        pass.icon,
        pass.coverImage,
        pass.licenseKey || "",
        pass.status,
        pass.planName,
        pass.pricePaid,
        pass.createdAt,
        pass.expiresAt || null,
        pass.discordConnected,
        pass.appType,
        pass.isTrialActive ?? null,
        pass.whopMembershipId || null,
        pass.verifiedOnWhop ?? false,
      ]
    );
  }

  return pass;
}

export async function updatePassStatus(
  keyOrId: string,
  status: "active" | "expired" | "canceled"
): Promise<boolean> {
  await ensureSchema();

  const result = await pool.query(
    `
      UPDATE nexus_passes
      SET status = $1
      WHERE id = $2
         OR license_key = $2
         OR whop_membership_id = $2
    `,
    [status, keyOrId]
  );

  return result.rowCount > 0;
}

export async function logWebhook(entry: StoredWebhookLog): Promise<void> {
  await ensureSchema();

  await pool.query(
    `
      INSERT INTO nexus_webhook_logs (
        id,
        action,
        timestamp,
        payload,
        status,
        signature_valid
      )
      VALUES ($1,$2,$3,$4::jsonb,$5,$6)
      ON CONFLICT (id)
      DO UPDATE SET
        action = EXCLUDED.action,
        timestamp = EXCLUDED.timestamp,
        payload = EXCLUDED.payload,
        status = EXCLUDED.status,
        signature_valid = EXCLUDED.signature_valid
    `,
    [
      entry.id,
      entry.action,
      entry.timestamp,
      JSON.stringify(entry.payload ?? {}),
      entry.status,
      entry.signatureValid,
    ]
  );

  await pool.query(`
    DELETE FROM nexus_webhook_logs
    WHERE id NOT IN (
      SELECT id
      FROM nexus_webhook_logs
      ORDER BY timestamp DESC
      LIMIT 100
    )
  `);
}

export async function isEventProcessed(eventId: string): Promise<boolean> {
  await ensureSchema();

  const result = await pool.query(
    `
      SELECT 1
      FROM nexus_processed_events
      WHERE event_id = $1
      LIMIT 1
    `,
    [eventId]
  );

  return result.rowCount > 0;
}

export async function markEventProcessed(eventId: string): Promise<void> {
  await ensureSchema();

  await pool.query(
    `
      INSERT INTO nexus_processed_events (event_id)
      VALUES ($1)
      ON CONFLICT (event_id) DO NOTHING
    `,
    [eventId]
  );

  await pool.query(`
    DELETE FROM nexus_processed_events
    WHERE event_id NOT IN (
      SELECT event_id
      FROM nexus_processed_events
      ORDER BY processed_at DESC
      LIMIT 500
    )
  `);
}

export async function addReview(
  productId: string,
  review: StoredReview
): Promise<void> {
  await ensureSchema();

  await pool.query(
    `
      INSERT INTO nexus_reviews (
        id,
        product_id,
        user_name,
        user_avatar,
        rating,
        comment,
        review_date,
        verified_buyer
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id)
      DO UPDATE SET
        product_id = EXCLUDED.product_id,
        user_name = EXCLUDED.user_name,
        user_avatar = EXCLUDED.user_avatar,
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        review_date = EXCLUDED.review_date,
        verified_buyer = EXCLUDED.verified_buyer
    `,
    [
      review.id,
      productId,
      review.userName,
      review.userAvatar,
      review.rating,
      review.comment,
      review.date,
      review.verifiedBuyer,
    ]
  );
}

export async function getReviews(productId: string): Promise<StoredReview[]> {
  await ensureSchema();

  const result = await pool.query(
    `
      SELECT
        id,
        product_id,
        user_name,
        user_avatar,
        rating,
        comment,
        review_date,
        verified_buyer
      FROM nexus_reviews
      WHERE product_id = $1
      ORDER BY review_date DESC
    `,
    [productId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    rating: Number(row.rating),
    comment: row.comment,
    date: new Date(row.review_date).toISOString(),
    verifiedBuyer: Boolean(row.verified_buyer),
  }));
}
