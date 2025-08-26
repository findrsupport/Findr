// Netlify Function: intent → filters (COMPLIANT)
// Processes ONLY user text, never listing payloads.
// Reads OPENAI_API_KEY from Netlify env vars (Functions scope).

/** @type {(event: { httpMethod:string, body?:string }) => Promise<{statusCode:number, headers:any, body:string}>} */
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
    // (Optional CORS if you ever call cross-origin)
    // "Access-Control-Allow-Origin": "*"
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
  }

  let text = "";
  try {
    const body = JSON.parse(event.body || "{}");
    text = String(body.text || "").slice(0, 2000);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Bad JSON" }) };
  }
  if (!text.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "text is required" }) };
  }

  const tools = [
    {
      type: "function",
      function: {
        name: "set_filters",
        description: "Convert plain-English real estate intent into structured filters (CAD). Use null for unspecified fields.",
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            min_price: { anyOf: [{ type: "number" }, { type: "null" }] },
            max_price: { anyOf: [{ type: "number" }, { type: "null" }] },
            beds_min:  { anyOf: [{ type: "number" }, { type: "null" }] },
            baths_min: { anyOf: [{ type: "number" }, { type: "null" }] },
            property_types: { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }] },
            areas:          { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }] },
            nearby:         { anyOf: [{ type: "array", items: { type: "object" } }, { type: "null" }] },
            must_have:      { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }] },
            polygon:        { anyOf: [{ type: "object" }, { type: "null" }] },
            sort: { type: "string", enum: ["relevance","price-asc","price-desc","beds-desc","baths-desc"] }
          }
        }
      }
    }
  ];

  const system = [
    "You are a precise intent parser for Canadian real estate search.",
    "Return filters only via the set_filters tool.",
    "Currency is CAD; interpret 'k' and 'M' accordingly.",
    "Infer city names if mentioned (e.g., Vancouver, Burnaby, Coquitlam...).",
    "If something isn’t specified, leave it null.",
    "Sort cues: 'cheapest'→price-asc, 'highest'→price-desc; otherwise relevance."
  ].join(" ");

  const payload = {
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "system", content: system },
      { role: "user",   content: text }
    ],
    tools,
    tool_choice: "auto"
  };

  try {
    console.log("[AI-LOG-INTENT-IN]", text.slice(0, 160));
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error("OpenAI error:", resp.status, errTxt);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Upstream error", detail: errTxt.slice(0, 200) }) };
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    let spec = {
      min_price: null, max_price: null, beds_min: null, baths_min: null,
      property_types: null, areas: null, nearby: null, must_have: null, polygon: null,
      sort: "relevance"
    };

    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        spec = Object.assign(spec, args || {});
      } catch (e) {
        console.warn("Tool args parse error:", e);
      }
    }

    console.log("[AI-LOG-INTENT-OUT]", spec);
    return { statusCode: 200, headers, body: JSON.stringify(spec) };
  } catch (e) {
    console.error("Handler error:", e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
