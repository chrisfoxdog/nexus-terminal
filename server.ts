import { WhopClient } from "@whop/sdk";

function getWhopClient() {
  return new WhopClient({
    token: process.env.WHOP_API_KEY || "",
  });
}
import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  loadStore,
  savePass,
  getPassesForUser,
  updatePassStatus,
  logWebhook,
  isEventProcessed,
  markEventProcessed,
  addReview,
  getReviews,
  StoredPass,
  StoredWebhookLog,
} from "./server_db";
import { resolveWhopUserIdentity } from "./server_whop_auth";

const app = express();
const PORT = 3000;

// Capture raw body buffer for HMAC-SHA256 signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);

// Initialize Gemini client on server side
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return ai;
}

// --- WHOP WEBHOOK SIGNATURE VERIFIER (HMAC-SHA256 / SVIX COMPLIANT) ---
function verifyWhopWebhookSignature(
  rawBody: Buffer | string | undefined,
  headers: Record<string, string | string[] | undefined>
): { isValid: boolean; reason: string } {
  const secret = process.env.WHOP_WEBHOOK_SECRET?.trim();

  if (!secret) {
    return {
      isValid: false,
      reason: "WHOP_WEBHOOK_SECRET_NOT_CONFIGURED",
    };
  }

  const signatureHeader =
    (headers["whop-signature"] as string) ||
    (headers["webhook-signature"] as string) ||
    (headers["x-whop-signature"] as string);

  if (!signatureHeader) {
    return {
      isValid: false,
      reason: "MISSING_WHOP_SIGNATURE_HEADER",
    };
  }

  const payloadStr = Buffer.isBuffer(rawBody)
    ? rawBody.toString("utf-8")
    : rawBody || "";

  const msgId =
    (headers["webhook-id"] as string) ||
    (headers["whop-event-id"] as string) ||
    "";

  const msgTimestamp =
    (headers["webhook-timestamp"] as string) ||
    (headers["whop-timestamp"] as string) ||
    "";

  if (!msgId || !msgTimestamp) {
    return {
      isValid: false,
      reason: "MISSING_WEBHOOK_ID_OR_TIMESTAMP",
    };
  }

  try {
    const signedPayload = `${msgId}.${msgTimestamp}.${payloadStr}`;

    const key = Buffer.from(secret, "utf-8");

    if (key.length === 0) {
      return {
        isValid: false,
        reason: "INVALID_WEBHOOK_SECRET",
      };
    }

    const digest = crypto
      .createHmac("sha256", key)
      .update(signedPayload)
      .digest();

    const providedSignatures = signatureHeader
      .split(/\s+/)
      .map((token) => token.replace(/^v1[=,]/, "").trim())
      .filter(Boolean);

    for (const provided of providedSignatures) {
      try {
        const supplied = Buffer.from(provided, "base64");

        if (
          supplied.length === digest.length &&
          crypto.timingSafeEqual(supplied, digest)
        ) {
          return {
            isValid: true,
            reason: "VERIFIED_SVIX_HMAC_SHA256",
          };
        }
      } catch (_) {
        // Ignore malformed signature candidates and continue checking.
      }
    }

    return {
      isValid: false,
      reason: "SIGNATURE_VERIFICATION_FAILED",
    };
  } catch (err: any) {
    return {
      isValid: false,
      reason: `VERIFY_ERROR: ${err?.message || "unknown error"}`,
    };
  }
}
// --- DATABASE FAILURE HANDLING ---
// server_db.ts throws when the database is not configured (no
// DATABASE_URL) or unreachable, and Express 4 does not catch rejections
// from async handlers — an unguarded DB call would take the whole
// process down. Handlers that touch the DB route those failures here
// and degrade to a 503; behaviour is unchanged when the DB works.
function databaseUnavailable(
  res: express.Response,
  error: unknown,
  extra: Record<string, unknown> = {}
) {
  console.error("[Whop DB] Database operation failed:", error);
  return res.status(503).json({
    ...extra,
    error: "DATABASE_UNAVAILABLE",
    message:
      "The database is unavailable, so this request cannot be completed right now. Please try again later.",
  });
}

// --- API ROUTES ---

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Whop Production App Engine",
    store_ready: true,
  });
});

// Serve public static assets
app.use(express.static(path.join(process.cwd(), "public")));

// Direct asset download endpoint for Whop App Store assets
app.get("/api/v1/assets/download/:type", (req, res) => {
  const { type } = req.params;
  let fileName = "";
  let downloadName = "";

  if (type === "icon") {
    fileName = "whop_app_icon.jpg";
    downloadName = "whop_app_icon_512x512.jpg";
  } else if (type === "banner") {
    fileName = "whop_cover_banner.jpg";
    downloadName = "whop_cover_banner_1920x1080.jpg";
  } else if (type === "feature" || type === "screenshot") {
    fileName = "whop_feature_screenshot.jpg";
    downloadName = "whop_feature_screenshot_1920x1080.jpg";
  } else {
    return res.status(404).json({ error: "Asset not found" });
  }

  let filePath = path.resolve(process.cwd(), "public", fileName);
  if (!fs.existsSync(filePath)) {
    const imagesDir = path.resolve(process.cwd(), "src/assets/images");
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      const match = files.find((f: string) => f.includes(type === "banner" ? "banner" : type === "icon" ? "icon" : "feature"));
      if (match) {
        filePath = path.resolve(imagesDir, match);
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found on server" });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
  res.setHeader("Content-Type", "image/jpeg");
  fs.createReadStream(filePath).pipe(res);
});

// Whop Auth & User Identity Endpoint
// Identity comes from the verified Whop iframe user token (see
// server_whop_auth.ts) — never from a client-supplied user-ID header.
app.get("/api/v1/auth/me", async (req, res) => {
  const identity = await resolveWhopUserIdentity(req.headers);

  if (!identity) {
    return res.status(401).json({
      authenticated: false,
      error: "WHOP_AUTH_REQUIRED",
      message:
        "A valid Whop user identity is required. Open this app inside Whop so your session token is provided.",
    });
  }

  let passes: StoredPass[];
  try {
    passes = await getPassesForUser(identity.userId);
  } catch (error) {
    return databaseUnavailable(res, error);
  }

  return res.json({
    authenticated: true,
    auth_source: identity.source,
    user: {
      id: identity.userId,
      is_whop_authenticated: identity.source === "whop_token",
    },
    active_passes_count: passes.filter((p) => p.status === "active").length,
    passes,
  });
});

// Environment Configuration & Live Status
app.get("/api/v1/config/status", (_req, res) => {
  res.json({
    gemini_api_configured: !!process.env.GEMINI_API_KEY,
    whop_api_configured: !!process.env.WHOP_API_KEY,
    whop_webhook_secret_configured: !!process.env.WHOP_WEBHOOK_SECRET,
    whop_app_id:
      (process.env.WHOP_APP_ID || "").replace(/^\s*(WHOP_APP_ID|NEXT_PUBLIC_WHOP_APP_ID|VITE_WHOP_APP_ID)\s*=\s*/i, "").trim() ||
      (process.env.NEXT_PUBLIC_WHOP_APP_ID || "").replace(/^\s*(WHOP_APP_ID|NEXT_PUBLIC_WHOP_APP_ID|VITE_WHOP_APP_ID)\s*=\s*/i, "").trim() ||
      (process.env.VITE_WHOP_APP_ID || "").replace(/^\s*(WHOP_APP_ID|NEXT_PUBLIC_WHOP_APP_ID|VITE_WHOP_APP_ID)\s*=\s*/i, "").trim() ||
      "",
    whop_company_id: process.env.WHOP_COMPANY_ID || "",
    environment: process.env.NODE_ENV || "development",
    server_time: new Date().toISOString(),
  });
});

// Live Whop Company Information
app.get("/api/v1/whop/company", async (_req, res) => {
  if (!process.env.WHOP_API_KEY) {
    return res.status(400).json({ error: "WHOP_API_KEY not configured" });
  }
  try {
    const compRes = await fetch("https://api.whop.com/api/v5/company", {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
    });
    const company = await compRes.json();
    return res.json({ company });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Live Whop Products List
app.get("/api/v1/whop/products", async (_req, res) => {
  if (!process.env.WHOP_API_KEY) {
    return res.status(400).json({ error: "WHOP_API_KEY not configured" });
  }
  try {
    const prodRes = await fetch("https://api.whop.com/api/v5/company/products", {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
    });
    const products = await prodRes.json();
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Persistent Access Passes API
// Persistent Access Passes API
app.get("/api/v1/passes", async (req, res) => {
  const identity = await resolveWhopUserIdentity(req.headers);

  if (!identity) {
    return res.status(401).json({
      error: "WHOP_AUTH_REQUIRED",
      message:
        "A valid Whop user identity is required. Open this app inside Whop so your session token is provided.",
    });
  }

  let passes: StoredPass[];
  try {
    passes = await getPassesForUser(identity.userId);
  } catch (error) {
    return databaseUnavailable(res, error);
  }
  return res.json({ passes });
});

// Verify and Claim Access Pass
// Verify and Claim Access Pass - production Whop verification only
app.post("/api/v1/passes/claim", async (req, res) => {
  const { license_key, membership_id } = req.body;
  // The buyer identity is derived from the verified Whop iframe user
  // token (server_whop_auth.ts), never from a client-supplied ID header,
  // so a claimed pass is tied to the actual Whop buyer.
  const identity = await resolveWhopUserIdentity(req.headers);
  const userId = identity?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "WHOP_USER_AUTH_REQUIRED",
      message:
        "A verified Whop user identity is required to claim an access pass. Open this app inside Whop so your session token is provided.",
    });
  }

  if (!license_key && !membership_id) {
    return res.status(400).json({
      success: false,
      error: "MISSING_IDENTIFIER",
      message: "Provide a Whop license key or membership ID.",
    });
  }

  if (!process.env.WHOP_API_KEY) {
    return res.status(503).json({
      success: false,
      error: "WHOP_API_NOT_CONFIGURED",
      message: "Whop server verification is not configured.",
    });
  }

  try {
    let verification: any;

    if (membership_id) {
      const verifyResponse = await fetch(`http://127.0.0.1:${process.env.PORT || 3000}/api/v1/memberships/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membership_id }),
      });

      verification = await verifyResponse.json();

      if (!verifyResponse.ok || verification.valid !== true) {
        return res.status(403).json({
          success: false,
          error: "MEMBERSHIP_NOT_VERIFIED",
          message: "The supplied Whop membership could not be verified.",
        });
      }
    } else {
      const verifyResponse = await fetch(`http://127.0.0.1:${process.env.PORT || 3000}/api/v1/licenses/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key }),
      });

      verification = await verifyResponse.json();

      if (!verifyResponse.ok || verification.valid !== true) {
        return res.status(403).json({
          success: false,
          error: "LICENSE_NOT_VERIFIED",
          message: "The supplied Whop license could not be verified.",
        });
      }
    }

    const whopData = verification?.data || verification?.whop_details || verification;

    const verifiedMembershipId =
      verification?.membership_id ||
      whopData?.membership_id ||
      whopData?.id ||
      membership_id ||
      "";

    const verifiedLicenseKey =
      verification?.license_key ||
      whopData?.license_key ||
      whopData?.licenseKey ||
      license_key ||
      "";

    const verifiedProductId =
      verification?.product_id ||
      whopData?.product_id ||
      whopData?.product?.id ||
      "";

    if (!verifiedMembershipId && !verifiedLicenseKey) {
      return res.status(403).json({
        success: false,
        error: "VERIFICATION_DATA_MISSING",
        message: "Whop verification succeeded but did not return a usable access identifier.",
      });
    }

    let existingPasses: StoredPass[];
    try {
      existingPasses = await getPassesForUser(userId);
    } catch (error) {
      return databaseUnavailable(res, error, { success: false });
    }
    const existing = existingPasses.find(
      (pass) =>
        (verifiedMembershipId && pass.whopMembershipId === verifiedMembershipId) ||
        (verifiedLicenseKey && pass.licenseKey === verifiedLicenseKey)
    );

    if (existing) {
      return res.json({
        success: true,
        message: "Existing verified Whop access pass returned.",
        pass: existing,
      });
    }

    const status = String(whopData?.status || verification?.status || "").toLowerCase();
    if (status && !["active", "completed", "valid"].includes(status)) {
      return res.status(403).json({
        success: false,
        error: "WHOP_ACCESS_INACTIVE",
        message: "The verified Whop membership is not currently active.",
      });
    }

    const newPass: StoredPass = {
      id: `pass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      productId: verifiedProductId,
      productTitle: whopData?.product_name || whopData?.product?.title || "Verified Whop Access",
      creatorName: whopData?.creator_name || whopData?.company?.title || "Whop Creator",
      icon: whopData?.icon || whopData?.product?.icon || "⚡",
      coverImage: whopData?.cover_image || whopData?.product?.cover_image || "",
      licenseKey: verifiedLicenseKey,
      status: "active",
      planName: whopData?.plan_name || whopData?.plan?.title || "Verified Whop Membership",
      pricePaid: typeof whopData?.amount_total === "number" ? whopData.amount_total / 100 : Number(whopData?.amount || 0),
      createdAt: whopData?.created_at ? new Date(Number(whopData.created_at) * 1000).toISOString() : new Date().toISOString(),
      expiresAt: whopData?.expires_at ? new Date(Number(whopData.expires_at) * 1000).toISOString() : "",
      discordConnected: false,
      appType: whopData?.app_type || "signals",
      whopMembershipId: verifiedMembershipId,
      verifiedOnWhop: true,
    };

    let saved: StoredPass;
    try {
      saved = await savePass(newPass);
    } catch (error) {
      return databaseUnavailable(res, error, { success: false });
    }

    return res.json({
      success: true,
      message: "Whop access verified and pass created.",
      pass: saved,
    });
  } catch (error: any) {
    console.error("[Whop Pass Claim] Verification error:", error);
    return res.status(502).json({
      success: false,
      error: "WHOP_VERIFICATION_FAILED",
      message: "Whop verification could not be completed.",
    });
  }
});

// Live Whop License Key Validation API
app.post("/api/v1/licenses/validate", async (req, res) => {
  const { license_key, product_id } = req.body;

  if (!license_key) {
    return res.status(400).json({
      valid: false,
      error: "MISSING_LICENSE_KEY",
      message: "License key is required for Whop authorization check.",
    });
  }

  if (!process.env.WHOP_API_KEY) {
    return res.status(503).json({
      valid: false,
      status: "UNAVAILABLE",
      error: "WHOP_API_NOT_CONFIGURED",
      message: "Whop server verification is not configured.",
    });
  }

  try {
    const whopClient = getWhopClient();

    // Whop SDK supports retrieving a membership by software license key.
    const membershipResponse: any = await whopClient.memberships.retrieve({
      id: license_key,
    });
    const membership: any = membershipResponse.data;

    const status = String(membership?.status || "").toLowerCase();

    const isValid =
      membership?.valid === true ||
      status === "completed" ||
      status === "active" ||
      status === "valid" ||
      status === "trialing";

    const membershipProductId =
      membership?.product_id ||
      membership?.product?.id ||
      null;

    if (product_id && membershipProductId && membershipProductId !== product_id) {
      return res.json({
        valid: false,
        status: "INVALID",
        verified_source: "WHOP_SDK",
        license_key,
        product_id: membershipProductId,
        membership_id: membership?.id || null,
        plan_id: membership?.plan_id || membership?.plan?.id || null,
        whop_details: membership,
      });
    }

    return res.json({
      valid: isValid,
      status: isValid ? "ACTIVE" : "INVALID",
      verified_source: "WHOP_SDK",
      license_key: membership?.license_key || license_key,
      product_id: membershipProductId || product_id || null,
      membership_id: membership?.id || membership?.membership_id || null,
      plan_id: membership?.plan_id || membership?.plan?.id || null,
      expires_at: membership?.expires_at
        ? new Date(Number(membership.expires_at) * 1000).toISOString()
        : null,
      created_at: membership?.created_at
        ? new Date(Number(membership.created_at) * 1000).toISOString()
        : null,
      whop_details: membership,
    });
  } catch (error: any) {
    console.error("[Whop SDK] License validation error:", error);

    const statusCode = Number(error?.statusCode || error?.status || 0);

    if (statusCode === 404) {
      return res.status(404).json({
        valid: false,
        status: "INVALID",
        error: "KEY_NOT_FOUND",
        message: "The requested Whop license key could not be verified.",
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(502).json({
      valid: false,
      status: "UNAVAILABLE",
      error: "WHOP_VALIDATION_FAILED",
      message: "Whop could not be reached to verify this license.",
    });
  }
});

// Whop Membership Live Verification API
app.post("/api/v1/memberships/validate", async (req, res) => {
  const { membership_id } = req.body;

  if (!membership_id) {
    return res.status(400).json({
      valid: false,
      error: "MISSING_MEMBERSHIP_ID",
      message: "Membership ID is required.",
    });
  }

  if (!process.env.WHOP_API_KEY) {
    return res.status(503).json({
      valid: false,
      status: "UNAVAILABLE",
      error: "WHOP_API_NOT_CONFIGURED",
      message: "Whop server verification is not configured.",
    });
  }

  try {
    const whopClient = getWhopClient();

    // Whop SDK retrieves a membership directly by its mem_ ID.
    const membershipResponse: any = await whopClient.memberships.retrieve({
      id: membership_id,
    });
    const membership: any = membershipResponse.data;

    const status = String(membership?.status || "").toLowerCase();

    const isValid =
      membership?.valid === true ||
      status === "completed" ||
      status === "active" ||
      status === "valid" ||
      status === "trialing";

    return res.json({
      valid: isValid,
      status: isValid ? "ACTIVE" : "INVALID",
      verified_source: "WHOP_SDK",
      membership_id,
      data: membership,
    });
  } catch (error: any) {
    console.error("[Whop SDK] Membership validation error:", error);

    const statusCode = Number(error?.statusCode || error?.status || 0);

    if (statusCode === 404) {
      return res.status(404).json({
        valid: false,
        status: "INVALID",
        error: "MEMBERSHIP_NOT_FOUND",
        message: "The supplied Whop membership could not be verified.",
        membership_id,
      });
    }

    return res.status(502).json({
      valid: false,
      status: "UNAVAILABLE",
      error: "WHOP_VALIDATION_FAILED",
      message: "Whop could not be reached to verify this membership.",
    });
  }
});
// Production Whop Webhook Receiver Endpoint with HMAC SHA-256 verification
app.post("/api/v1/webhooks/receive", async (req, res) => {
  if (!process.env.WHOP_WEBHOOK_SECRET) {
    console.error("[Whop Webhook Security] WHOP_WEBHOOK_SECRET is not configured.");
    return res.status(503).json({
      received: false,
      error: "WEBHOOK_SECRET_NOT_CONFIGURED",
      message: "Webhook processing is disabled until WHOP_WEBHOOK_SECRET is configured.",
    });
  }

  const verification = verifyWhopWebhookSignature(
    (req as any).rawBody,
    req.headers as Record<string, string | string[] | undefined>
  );

  if (!verification.isValid) {
    console.warn(`[Whop Webhook Security] REJECTED webhook: ${verification.reason}`);
    return res.status(401).json({
      received: false,
      error: "UNAUTHORIZED_WEBHOOK_SIGNATURE",
      reason: verification.reason,
    });
  }

  const body = req.body || {};

  if (!body.id) {
    return res.status(400).json({
      received: false,
      error: "MISSING_EVENT_ID",
      message: "Webhook event ID is required.",
    });
  }

  const eventId = body.id;
  const action = body.action || body.event_type || body.type;
  const data = body.data;

  if (!action || !data) {
    return res.status(400).json({
      received: false,
      error: "INVALID_WEBHOOK_PAYLOAD",
      message: "Webhook action and data are required.",
    });
  }

  try {
    if (await isEventProcessed(eventId)) {
      console.log(`[Whop Webhook Idempotency] Skipping duplicate event ${eventId}`);
      return res.json({
        received: true,
        status: "DUPLICATE_IGNORED",
        event_id: eventId,
      });
    }

    if (
      action === "membership.went_valid" ||
      action === "membership.activated" ||
      action === "membership.created" ||
      action === "payment.succeeded"
    ) {
      const userId = data.user_id || data.user?.id;
      const productId = data.product_id || data.product?.id;
      const memId = data.membership_id || data.id;

      if (!userId || !productId || !memId) {
        return res.status(400).json({
          received: false,
          error: "INCOMPLETE_MEMBERSHIP_EVENT",
          message: "A valid access event must contain user_id, product_id, and membership_id.",
        });
      }

      await savePass({
        id: `pass_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        productId,
        productTitle: data.product_name || "Verified Whop Access",
        creatorName: data.creator_name || "Whop Creator",
        icon: data.icon || "⚡",
        coverImage: data.cover_image || "",
        licenseKey: data.license_key || "",
        status: "active",
        planName: data.plan_name || "Verified Subscription",
        pricePaid:
          typeof data.amount_total === "number"
            ? data.amount_total / 100
            : Number(data.amount || 0),
        createdAt: new Date().toISOString(),
        expiresAt: data.expires_at
          ? new Date(Number(data.expires_at) * 1000).toISOString()
          : "",
        discordConnected: false,
        appType: data.app_type || "signals",
        whopMembershipId: memId,
        verifiedOnWhop: true,
      });

      console.log(`[Whop Webhook Engine] Verified access for user ${userId}`);
    } else if (
      action === "membership.went_invalid" ||
      action === "membership.deleted" ||
      action === "membership.cancelled"
    ) {
      const memId = data.membership_id || data.id;

      if (!memId) {
        return res.status(400).json({
          received: false,
          error: "MISSING_MEMBERSHIP_ID",
          message: "A membership identifier is required to revoke access.",
        });
      }

      await updatePassStatus(memId, "expired");
      console.log(`[Whop Webhook Engine] Revoked access for membership ${memId}`);
    }

    const logEntry: StoredWebhookLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      timestamp: new Date().toISOString(),
      payload: body,
      status: "SIGNATURE_VERIFIED",
      signatureValid: true,
    };

    await logWebhook(logEntry);
    await markEventProcessed(eventId);

    return res.json({
      received: true,
      action,
      log_id: logEntry.id,
      signature_verification: verification.reason,
      timestamp: logEntry.timestamp,
    });
  } catch (error) {
    return databaseUnavailable(res, error, { received: false });
  }
});

// Fetch Webhook History
app.get("/api/v1/webhooks/history", async (_req, res) => {
  try {
    const store = await loadStore();
    return res.json({
      total_received: store.webhookLogs.length,
      logs: store.webhookLogs,
    });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});


// Production builds do not expose a webhook simulation endpoint.
// Real webhook events must arrive through /api/v1/webhooks/receive.
// and pass cryptographic signature verification.

// Gemini AI Product Copy Generator
app.post("/api/gemini/generate-product-copy", async (req, res) => {
  try {
    const { product_type, product_title, target_audience, tone } = req.body;
    const gemini = getGeminiClient();


    if (!gemini) {
      // Fallback mock copy if API key is not yet set
      return res.json({
        title: product_title || "Digital Access Pass",
        description: `A ${product_type || "digital product"} for ${target_audience || "creators and their members"}. Access is delivered through Whop: when a membership becomes valid, the member's pass activates in Nexus Terminal; when it ends, access is revoked automatically. (Sample copy — no Gemini key is configured.)`,
        bullet_points: [
          "Access pass activated automatically after Whop verifies the membership",
          "License key validation available for software products",
          "Member portal with course, lounge, and download views",
          "You control the content, pricing, and refunds in Whop",
        ],
        marketing_tagline: "Sell through Whop, deliver through Nexus Terminal.",
        recommended_price: "Set your own price in Whop — this tool does not set prices for you.",
      });
    }

    const prompt = `You are a Whop marketplace copywriter helping a creator describe their own product honestly.
Generate a clear Whop product profile based on the details below.
Rules: never promise income, returns, win rates, or results; never invent testimonials, member counts, ratings, or sales figures; describe only features the creator actually provides.
- Product Category/Type: ${product_type || "Software/Trading Signals/Course/Community"}
- Product Name: ${product_title || "Digital Access Pass"}
- Target Audience: ${target_audience || "Entrepreneurs, Traders, Developers"}
- Tone: ${tone || "High-energy, authoritative, premium"}

Return a raw JSON object with keys:
- "title": (String) optimized snappy product title
- "tagline": (String) punchy 1-sentence value proposition
- "description": (String) compelling multi-paragraph description highlighting features and benefits
- "bullet_points": (Array of Strings, 4 bullet items) starting with emojis
- "discord_welcome": (String) warm greeting text for buyers joining the private Discord/Whop portal
- "pricing_strategy": (String) recommended pricing strategy (e.g. $49/mo with 7-day free trial)
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text?.trim() || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini copy generation error:", error);
    res.status(500).json({
      error: "AI_GENERATION_FAILED",
      message: error.message || "Failed to generate product copy.",
    });
  }
});

// Gemini AI Assistant - AI Trading Signal / Alert Generator
app.post("/api/gemini/generate-signals", async (req, res) => {
  try {
    const { asset, strategy } = req.body;
    const gemini = getGeminiClient();

    if (!gemini) {
      return res.json({
        asset: asset || "EXAMPLE",
        action: "BUY / LONG",
        entry_zone: "Example format only — no live data",
        target_1: "—",
        target_2: "—",
        stop_loss: "—",
        risk_reward: "—",
        reasoning: "Sample alert showing the format only (no Gemini key configured). Nexus Terminal does not generate trading advice, predictions, or performance figures.",
      });
    }

    const prompt = `You are drafting a market-watch alert for a creator to review and edit before publishing in their own channel.
Draft an alert for asset "${asset || "ETH/USDT"}" using style "${strategy || "Breakout / Swing Trading"}".
Rules: this is a draft for the creator's own judgment, not financial advice. Do not claim a win rate, track record, or guaranteed outcome, and end the reasoning by noting it is educational draft content, not a recommendation.
Return raw JSON with keys:
- "asset": String
- "action": String (e.g. "BUY / LONG" or "SELL / SHORT")
- "entry_zone": String
- "target_1": String
- "target_2": String
- "stop_loss": String
- "risk_reward": String
- "reasoning": String (2 sentences explanation)
- "timeframe": String
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    data.disclaimer = "AI-generated draft for the creator to review. Not financial advice; Nexus Terminal does not track or claim any win rate or returns.";
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Gemini AI Product Advisory Chat Endpoint
app.post("/api/gemini/product-chat", async (req, res) => {
  try {
    const { message, history, selectedProductId, products } = req.body;

    const gemini = getGeminiClient();

    // Catalog summary format
    const productsCatalogSummary = Array.isArray(products) && products.length > 0
      ? products.map((p: any) => `- Product ID: ${p.id} | Name: "${p.title}" | Creator: ${p.creatorName} | Category: ${p.category} | Rating: ${p.rating} Stars (${p.reviewCount} reviews) | Members: ${p.totalMembers} | Price Plans: ${p.plans?.map((pl: any) => `$${pl.price}/${pl.interval} (${pl.name})`).join(", ")} | Tagline: ${p.shortTagline} | Key Features: ${p.features?.join("; ")}`).join("\n")
      : "No catalog provided.";

    const selectedProductObj = Array.isArray(products)
      ? products.find((p: any) => p.id === selectedProductId)
      : null;

    if (!gemini) {
      // Fallback response if GEMINI_API_KEY is not configured
      let reply = "Hello! I am the Nexus Terminal product advisor. ";
      const queryLower = (message || "").toLowerCase();

      const catalog: any[] = Array.isArray(products) ? products : [];
      const categoryFor = (q: string) =>
        q.includes("signal") || q.includes("trade") || q.includes("crypto") ? "trading"
        : q.includes("saas") || q.includes("code") || q.includes("developer") || q.includes("software") || q.includes("license") ? "saas"
        : q.includes("vault") || q.includes("download") || q.includes("template") ? "saas"
        : q.includes("course") || q.includes("lesson") || q.includes("learn") ? "education"
        : q.includes("community") || q.includes("chat") ? "coaching"
        : null;
      const matched = catalog.find((prod: any) => prod.category === categoryFor(queryLower));

      if (selectedProductObj) {
        reply += `Regarding **${selectedProductObj.title}** ($${selectedProductObj.plans[0]?.price}/${selectedProductObj.plans[0]?.interval}): it includes ${selectedProductObj.features.slice(0, 3).join(", ")}.${selectedProductObj.isSample ? " Note: this is a sample template, not a live offer — checkout is disabled until the creator attaches a real Whop plan." : ""}`;
      } else if (matched) {
        reply += `From the current catalog, the closest match is **${matched.title}** — ${matched.shortTagline}${matched.isSample ? " It is a sample template showing the format, not a live offer." : ""}`;
      } else {
        reply += "I can help you compare the products in this catalog, answer questions about specific features, or explain pricing plans. I only recommend products that are actually listed here — what are you looking for?";
      }

      return res.json({
        reply,
        recommendedProductId: selectedProductId || matched?.id
      });
    }

    const systemPrompt = `You are "Nexus AI Advisor", a smart, concise, and helpful product assistant for Nexus Terminal.
You answer user questions about the products listed in this catalog.
Honesty rules: only mention products, prices, ratings, and member counts that appear in the catalog below; never invent products or figures; never promise income, returns, win rates, or results; if a product is marked as a sample template, say so plainly.

HERE IS THE CURRENT MARKETPLACE PRODUCTS CATALOG:
${productsCatalogSummary}

${selectedProductObj ? `THE USER IS CURRENTLY FOCUSING ON THIS SPECIFIC PRODUCT:
Name: ${selectedProductObj.title}
Category: ${selectedProductObj.category}
Price Plans: ${JSON.stringify(selectedProductObj.plans)}
Features: ${selectedProductObj.features.join(", ")}
Description: ${selectedProductObj.fullDescription}
` : "The user has not selected a specific product yet."}

RULES:
1. Provide concise, friendly, and well-formatted answers (use Markdown bolding for product names and prices).
2. If the user asks for recommendations, match their intent to the most relevant product from the catalog.
3. Be transparent about pricing plans and renewal periods, and about what the app does and does not do.
4. Keep responses conversational, helpful, and focused on value (maximum 3 short paragraphs or bullet points).
5. If relevant, mention the specific Product ID or exact product title so the user can easily view or unlock it.`;

    const conversationContents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        conversationContents.push(`${h.role === "user" ? "User" : "Assistant"}: ${h.text}`);
      }
    }
    conversationContents.push(`User: ${message}`);

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationContents.join("\n")}\n\nAssistant:`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
    });

    const replyText = response.text?.trim() || "I'm happy to answer any questions about our Whop access passes!";

    // Attempt to identify if a product was recommended in the reply text
    let matchedProdId: string | undefined = selectedProductId;
    if (Array.isArray(products)) {
      for (const p of products) {
        if (replyText.toLowerCase().includes(p.title.toLowerCase())) {
          matchedProdId = p.id;
          break;
        }
      }
    }

    res.json({
      reply: replyText,
      recommendedProductId: matchedProdId,
    });
  } catch (error: any) {
    console.error("Gemini product chat error:", error);
    res.status(500).json({
      error: "CHAT_FAILED",
      reply: "I'm having a brief issue connecting to Whop AI servers, but I'm here to help! You can explore product details or select any pass to view plans.",
    });
  }
});

// START SERVER WITH VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Whop App Engine listening on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}














export default app;







