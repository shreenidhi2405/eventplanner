import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !publishableKeys || !geminiApiKey) return json({ error: "AI service is not configured." }, 503);

  let publishableKey: string;
  try { publishableKey = JSON.parse(publishableKeys).default; }
  catch { return json({ error: "Supabase publishable key configuration is invalid." }, 500); }
  if (!publishableKey) return json({ error: "Supabase publishable key is unavailable." }, 500);

  const supabase = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: "Invalid or expired session." }, 401);

  let body: { prompt?: string; event?: Record<string, unknown> };
  try { body = await req.json(); }
  catch { return json({ error: "Request body must be valid JSON." }, 400); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 6000) return json({ error: "Prompt is required and must be under 6000 characters." }, 400);

  const event = body.event && typeof body.event === "object" ? body.event : {};
  const safeContext = {
    title: String(event.title ?? "Untitled event").slice(0, 160),
    type: String(event.type ?? "celebration").slice(0, 60),
    currency: String(event.currency ?? "INR").slice(0, 8),
    targetBudget: Number(event.targetBudget) || 0,
    guestCount: Number(event.guestCount) || 0,
    location: String(event.location ?? "Not specified").slice(0, 160),
    date: String(event.date ?? "Not specified").slice(0, 60),
    themeVibe: String(event.themeVibe ?? "").slice(0, 1000),
  };
  const systemPrompt = `You are Aura, a helpful event-planning assistant. Give practical, accurate, well-organized advice in Markdown. Never claim to have performed bookings or actions.
Event context:
${JSON.stringify(safeContext)}`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": geminiApiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
      }),
    });
    if (!response.ok) {
      console.error("Gemini provider error", response.status, (await response.text()).slice(0, 1000));
      return json({ error: "The AI provider could not complete the request. Please try again later." }, 502);
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "";
    if (!text) return json({ error: "The AI provider returned an empty response." }, 502);
    return json({ text });
  } catch (error) {
    console.error("Event AI request failed", error);
    return json({ error: "Unable to reach the AI provider right now." }, 502);
  }
});
