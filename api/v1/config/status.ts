function cleanAppId(value: string | undefined): string {
if (!value) return "";

return value
.replace(
/^\s*(WHOP_APP_ID|NEXT_PUBLIC_WHOP_APP_ID|VITE_WHOP_APP_ID)\s*=\s*/i,
""
)
.trim();
}

export default function handler(
_req: any,
res: any
) {
const appId =
cleanAppId(process.env.WHOP_APP_ID) ||
cleanAppId(process.env.NEXT_PUBLIC_WHOP_APP_ID) ||
cleanAppId(process.env.VITE_WHOP_APP_ID) ||
"";

return res.status(200).json({
gemini_api_configured: !!process.env.GEMINI_API_KEY,
whop_api_configured: !!process.env.WHOP_API_KEY,
whop_webhook_secret_configured: !!process.env.WHOP_WEBHOOK_SECRET,
whop_app_id: appId,
whop_company_id:
process.env.WHOP_COMPANY_ID || "",
environment: process.env.NODE_ENV || "production",
server_time: new Date().toISOString(),
});
}
