export type ScannedBillData = {
  date?: string;
  invoiceNumber?: string;
  supplierName?: string;
  supplierPan?: string;
  goodsOrService?: string;
  taxableAmount?: number;
  vatAmount?: number;
  totalAmount?: number;
  confidence?: number;
  rawText?: string;
};

type OpenRouterBillExtract = {
  date?: string;
  invoiceNumber?: string;
  supplierName?: string;
  supplierPan?: string;
  goodsOrService?: string;
  taxableAmount?: number | string;
  vatAmount?: number | string;
  totalAmount?: number | string;
  confidence?: number | string;
  rawText?: string;
};

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function detectMimeType(buffer: Buffer) {
  if (buffer.length >= 4) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }

    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "image/png";
    }

    const header = buffer.subarray(0, 4).toString("ascii");
    if (header === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
      return "image/webp";
    }
  }

  return "image/jpeg";
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
        return null;
      }
    }

    return null;
  }
}

function normalizeExtract(payload: OpenRouterBillExtract): ScannedBillData {
  return {
    date: payload.date || "",
    invoiceNumber: payload.invoiceNumber || "",
    supplierName: payload.supplierName || "",
    supplierPan: payload.supplierPan || "",
    goodsOrService: payload.goodsOrService || "",
    taxableAmount: toNumber(payload.taxableAmount),
    vatAmount: toNumber(payload.vatAmount),
    totalAmount: toNumber(payload.totalAmount),
    confidence: Math.max(0, Math.min(1, toNumber(payload.confidence) || 0)),
    rawText: payload.rawText || "",
  };
}

async function extractWithOpenRouter(buffer: Buffer): Promise<ScannedBillData> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing. Please add it to .env.local.");
  }

  const mimeType = detectMimeType(buffer);
  const imageDataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost:3000",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE || "Accounting App",
      "X-OpenRouter-Metadata": "enabled",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You extract Nepali purchase bill details from images. Return ONLY valid JSON with keys: date, invoiceNumber, supplierName, supplierPan, goodsOrService, taxableAmount, vatAmount, totalAmount, confidence, rawText. Use ISO date YYYY-MM-DD when visible. If a field is missing, use an empty string or 0. confidence must be a number from 0 to 1.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Extract the purchase bill details from this image. Return only JSON and no markdown.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter OCR failed (${response.status}): ${errorText.slice(0, 250)}`
    );
  }

  const result = await response.json();
  const messageContent = result?.choices?.[0]?.message?.content;
  const parsed =
    typeof messageContent === "string"
      ? safeJsonParse(messageContent)
      : messageContent && typeof messageContent === "object"
      ? messageContent
      : null;

  if (!parsed) {
    throw new Error("OpenRouter returned an unparseable OCR response.");
  }

  return normalizeExtract(parsed as OpenRouterBillExtract);
}

export async function scanBillImage(buffer: Buffer): Promise<ScannedBillData> {
  return extractWithOpenRouter(buffer);
}
