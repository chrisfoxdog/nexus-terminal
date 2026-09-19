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
// Whop Auth & User Identity Endpoint
app.get("/api/v1/auth/me", async (req, res) => {
  const whopUserId = req.headers["x-whop-user-id"] as string | undefined;

  if (!whopUserId) {
    return res.status(401).json({
      authenticated: false,
      error: "WHOP_AUTH_REQUIRED",
      message: "A valid Whop user identity is required.",
    });
  }

  const passes = await getPassesForUser(whopUserId);

  return res.json({
    authenticated: true,
    user: {
      id: whopUserId,
      is_whop_authenticated: true,
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
      process.env.WHOP_APP_ID ||
      process.env.NEXT_PUBLIC_WHOP_APP_ID ||
      process.env.VITE_WHOP_APP_ID ||
      "app_gzeMFmZKMcOdbA",
    whop_company_id: process.env.WHOP_COMPANY_ID || "biz_DcAqjfC3rHB0s1",
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
  const userId = req.headers["x-whop-user-id"] as string | undefined;

  if (!userId) {
    return res.status(401).json({
      error: "WHOP_AUTH_REQUIRED",
      message: "A valid Whop user identity is required.",
    });
  }

  const passes = await getPassesForUser(userId);
  return res.json({ passes });
});

// Verify and Claim Access Pass
// Verify and Claim Access Pass - production Whop verification only
app.post("/api/v1/passes/claim", async (req, res) => {
  const { license_key, membership_id } = req.body;
  const userId = req.headers["x-whop-user-id"] as string | undefined;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "WHOP_USER_AUTH_REQUIRED",
      message: "A verified Whop user identity is required to claim an access pass.",
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

    const existingPasses = await getPassesForUser(userId);
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

    const saved = await savePass(newPass);

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
  const action = body.action || body.event_type;
  const data = body.data;

  if (!action || !data) {
    return res.status(400).json({
      received: false,
      error: "INVALID_WEBHOOK_PAYLOAD",
      message: "Webhook action and data are required.",
    });
  }

  if (isEventProcessed(eventId)) {
    console.log(`[Whop Webhook Idempotency] Skipping duplicate event ${eventId}`);
    return res.json({
      received: true,
      status: "DUPLICATE_IGNORED",
      event_id: eventId,
    });
  }

  markEventProcessed(eventId);

  if (
    action === "membership.went_valid" ||
    action === "membership.created" ||
    action === "payment.succeeded"
  ) {
    const userId = data.user_id;
    const productId = data.product_id;
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

    updatePassStatus(memId, "expired");
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

  logWebhook(logEntry);

  return res.json({
    received: true,
    action,
    log_id: logEntry.id,
    signature_verification: verification.reason,
    timestamp: logEntry.timestamp,
  });
});

// Fetch Webhook History
app.get("/api/v1/webhooks/history", async (_req, res) => {
  const store = loadStore();
  res.json({
    total_received: (await store).webhookLogs.length,
    logs: (await store).webhookLogs,
  });
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
        title: product_title || "Elite Digital Access Pass",
        description: `Unlock high-converting ${product_type || "digital product"} built for ${target_audience || "ambitious creators and traders"}. Includes instant Whop license key generation, exclusive Discord community access, live updates, and private file downloads.`,
        bullet_points: [
          "âš¡ Instant automated access pass delivery upon checkout",
          "ðŸ”’ Direct integration with Whop SDK license validator",
          "ðŸ’¬ Exclusive VIP Discord & Telegram group unlocks",
          "ðŸ“ˆ Regular bonus strategy drops and weekly live Q&As",
        ],
        marketing_tagline: "Supercharge your digital workflow with verified Whop access.",
        recommended_price: "$49/month or $399 one-time",
      });
    }

    const prompt = `You are an expert Whop digital marketplace strategist and creator copywriter. 
Generate a high-converting Whop product profile based on the details below:
- Product Category/Type: ${product_type || "Software/Trading Signals/Course/Community"}
- Product Name: ${product_title || "Apex Digital Pass"}
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
        asset: asset || "BTC/USDT",
        action: "BUY / LONG",
        entry_zone: "$91,200 - $91,600",
        target_1: "$93,500",
        target_2: "$95,800",
        stop_loss: "$89,800",
        risk_reward: "1 : 2.8",
        reasoning: "Bullish divergence on 4h timeframe with strong Whop community order flow confluence.",
      });
    }

    const prompt = `You are a top-tier quantitative crypto & stock market analyst creating signal alerts for a high-value Whop signal channel.
Generate a realistic trading signal update for asset "${asset || "ETH/USDT"}" using strategy style "${strategy || "Breakout / Swing Trading"}".
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
      let reply = "Hello! I am your Whop Product Advisor AI. ";
      const queryLower = (message || "").toLowerCase();

      if (selectedProductObj) {
        reply += `Regarding **${selectedProductObj.title}** ($${selectedProductObj.plans[0]?.price}/${selectedProductObj.plans[0]?.interval}): It features ${selectedProductObj.features.slice(0, 3).join(", ")}. It currently has ${selectedProductObj.totalMembers.toLocaleString()} active pass holders with a ${selectedProductObj.rating} star rating!`;
      } else if (queryLower.includes("signal") || queryLower.includes("trade") || queryLower.includes("crypto") || queryLower.includes("algo")) {
        reply += "For trading & signals, our top recommendation is **Apex Algo VIP** ($199/month) for institutional algorithmic alerts or **Quant Crypto Alpha** ($149/month) for automated crypto swing setups.";
      } else if (queryLower.includes("saas") || queryLower.includes("code") || queryLower.includes("developer") || queryLower.includes("starter")) {
        reply += "For developers and founders, check out **SaaS Starter Kit & Whop Boilerplate** ($89/month), which includes full React + Node + Whop SDK boilerplate with license key validation built-in!";
      } else if (queryLower.includes("notion") || queryLower.includes("vault") || queryLower.includes("template")) {
        reply += "**Notion Creator Hub & Vault** ($29 lifetime) is our top pick for organizing content, tracking sponsorships, and managing digital products!";
      } else {
        reply += "I can help you compare access passes, answer questions about specific product features, explain pricing tiers, or recommend the best Whop pass for your goals. What are you looking to unlock today?";
      }

      return res.json({
        reply,
        recommendedProductId: selectedProductId || (queryLower.includes("trade") ? "prod_apex_trader_vip" : queryLower.includes("saas") ? "prod_saas_starter_kit" : undefined)
      });
    }

    const systemPrompt = `You are "Whop AI Advisor", an enthusiastic, smart, concise, and helpful product assistant for the Whop Digital Access Pass Marketplace.
You answer user questions about digital products, courses, signals, SaaS templates, and access passes listed in our marketplace.

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
3. Be transparent about pricing plans, renewal periods, Discord role auto-assignment, and Whop license keys.
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







