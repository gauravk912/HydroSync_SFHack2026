import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Producer schema (based on what you pasted)
 * - company_name
 * - location (string)
 * - volume_available_gallons (number)
 * - model_output: { recommended, confidence, compatible: string[] }
 * - prediction_raw: { compatible: [{industry, prob, compatible}] }   (snake_case)
 */

function normText(s: string) {
  return (s || "").trim().toLowerCase();
}

/**
 * Normalize industry strings to a comparable "canonical" form
 * Handles:
 * - "Cooling Once Through" -> "cooling_once_through"
 * - "cooling_once_through" -> "cooling_once_through"
 * - "Data Center cooling" -> stays text, later Gemini maps to canonical
 */
function toSnakeIndustry(label: string) {
  const x = normText(label);
  // if already snake_case-ish
  if (x.includes("_")) return x.replace(/\s+/g, "_");
  // Title / words -> snake
  return x
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "_");
}

/**
 * Extract the producer "compatible industries" list in snake_case
 * Prefer prediction_raw.compatible (already snake_case),
 * else fall back to model_output.compatible (Title Case).
 */
function getProducerCompatibleSnake(p: any): { industries: string[]; probs: Record<string, number> } {
  const probs: Record<string, number> = {};

  // If prediction_raw.compatible exists (snake_case + prob), use it
  const pr = p?.prediction_raw?.compatible;
  if (Array.isArray(pr) && pr.length) {
    const inds = pr
      .filter((r: any) => r?.industry && (r?.compatible === 1 || r?.compatible === true))
      .map((r: any) => {
        const ind = toSnakeIndustry(String(r.industry));
        const prob = Number(r.prob);
        if (Number.isFinite(prob)) probs[ind] = prob;
        return ind;
      });
    return { industries: Array.from(new Set(inds)), probs };
  }

  // Else use model_output.compatible (Title Case list)
  const mo = p?.model_output?.compatible;
  if (Array.isArray(mo) && mo.length) {
    const inds = mo.map((x: any) => toSnakeIndustry(String(x)));
    // we may have top5 with probabilities:
    const top5 = p?.model_output?.top5;
    if (Array.isArray(top5)) {
      for (const t of top5) {
        if (!t?.industry) continue;
        const ind = toSnakeIndustry(String(t.industry));
        const prob = Number(t.probability);
        if (Number.isFinite(prob)) probs[ind] = prob;
      }
    }
    return { industries: Array.from(new Set(inds)), probs };
  }

  return { industries: [], probs: {} };
}

/**
 * OPTIONAL Gemini: normalize consumer input to one of your canonical labels
 * Returns snake_case label like "cooling_once_through"
 */
async function geminiNormalizeConsumerIndustry(raw: string, allowedSnake: string[]) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return toSnakeIndustry(raw);

    const mod: any = await import("@google/generative-ai");
    const GoogleGenerativeAI = mod.GoogleGenerativeAI;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a strict classifier for industrial water reuse industries.

Pick EXACTLY ONE label from this list and return ONLY that label:
${allowedSnake.map((x) => `- ${x}`).join("\n")}

User need: "${raw}"

Return ONLY one label from the list. No extra text.
`.trim();

    const r = await model.generateContent(prompt);
    const out = (r?.response?.text?.() ?? "").trim().toLowerCase();

    // accept only exact match
    const match = allowedSnake.find((x) => x.toLowerCase() === out);
    return match ?? toSnakeIndustry(raw);
  } catch {
    return toSnakeIndustry(raw);
  }
}

/**
 * OPTIONAL Gemini: estimate distance in km between 2 location strings.
 * This is hackathon-friendly, but not "perfectly reliable".
 */
async function geminiEstimateDistanceKm(from: string, to: string): Promise<number> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Number.POSITIVE_INFINITY;

  try {
    const mod: any = await import("@google/generative-ai");
    const GoogleGenerativeAI = mod.GoogleGenerativeAI;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Estimate the driving distance in kilometers between these two places.
Return ONLY a JSON object with a single field: {"distance_km": number}

From: "${from}"
To: "${to}"

Rules:
- distance_km must be a number (no strings)
- no extra keys, no commentary
`.trim();

    const r = await model.generateContent(prompt);
    const text = (r?.response?.text?.() ?? "").trim();

    // extract JSON (sometimes it wraps in ```json)
    const m = text.match(/```json([\s\S]*?)```/i);
    const rawJson = (m?.[1] ? m[1] : text).trim();

    const parsed = JSON.parse(rawJson);
    const km = Number(parsed?.distance_km);
    return Number.isFinite(km) ? km : Number.POSITIVE_INFINITY;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/**
 * Utility: choose best single / pair / multi allocation.
 * scoredCandidates must already include:
 * - availableGallons
 * - distanceKm
 * - confidence
 */
function allocateBest(
  demandQty: number,
  scoredCandidates: any[]
): { mode: "SINGLE" | "PAIR" | "MULTI"; selections: any[]; remainingGallons: number } {
  // Sort: distance asc, confidence desc, quantity desc
  scoredCandidates.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return b.availableGallons - a.availableGallons;
  });

  // SINGLE
  const single = scoredCandidates.find((p) => p.availableGallons >= demandQty);
  if (single) {
    return {
      mode: "SINGLE",
      selections: [
        {
          producerId: single.producerId,
          company_name: single.company_name,
          location: single.location,
          allocatedGallons: demandQty,
          availableGallons: single.availableGallons,
          distanceKm: single.distanceKm,
          confidence: single.confidence,
          recommended: single.recommended,
          compatibleProb: single.compatibleProb,
          gemini_summary: single.gemini_summary,
        },
      ],
      remainingGallons: 0,
    };
  }

  // PAIR (shortest total distance that satisfies)
  let bestPair: { a: any; b: any; score: number } | null = null;
  for (let i = 0; i < scoredCandidates.length; i++) {
    for (let j = i + 1; j < scoredCandidates.length; j++) {
      const sum = scoredCandidates[i].availableGallons + scoredCandidates[j].availableGallons;
      if (sum < demandQty) continue;

      const score = scoredCandidates[i].distanceKm + scoredCandidates[j].distanceKm;
      if (!bestPair || score < bestPair.score) bestPair = { a: scoredCandidates[i], b: scoredCandidates[j], score };
    }
  }

  if (bestPair) {
    let remaining = demandQty;
    const allocA = Math.min(bestPair.a.availableGallons, remaining);
    remaining -= allocA;
    const allocB = Math.min(bestPair.b.availableGallons, remaining);
    remaining -= allocB;

    return {
      mode: "PAIR",
      selections: [
        {
          producerId: bestPair.a.producerId,
          company_name: bestPair.a.company_name,
          location: bestPair.a.location,
          allocatedGallons: allocA,
          availableGallons: bestPair.a.availableGallons,
          distanceKm: bestPair.a.distanceKm,
          confidence: bestPair.a.confidence,
          recommended: bestPair.a.recommended,
          compatibleProb: bestPair.a.compatibleProb,
          gemini_summary: bestPair.a.gemini_summary,
        },
        {
          producerId: bestPair.b.producerId,
          company_name: bestPair.b.company_name,
          location: bestPair.b.location,
          allocatedGallons: allocB,
          availableGallons: bestPair.b.availableGallons,
          distanceKm: bestPair.b.distanceKm,
          confidence: bestPair.b.confidence,
          recommended: bestPair.b.recommended,
          compatibleProb: bestPair.b.compatibleProb,
          gemini_summary: bestPair.b.gemini_summary,
        },
      ],
      remainingGallons: remaining,
    };
  }

  // MULTI greedy
  let remaining = demandQty;
  const selections: any[] = [];
  for (const p of scoredCandidates) {
    if (remaining <= 0) break;
    if (p.availableGallons <= 0) continue;
    const alloc = Math.min(p.availableGallons, remaining);
    remaining -= alloc;

    selections.push({
      producerId: p.producerId,
      company_name: p.company_name,
      location: p.location,
      allocatedGallons: alloc,
      availableGallons: p.availableGallons,
      distanceKm: p.distanceKm,
      confidence: p.confidence,
      recommended: p.recommended,
      compatibleProb: p.compatibleProb,
      gemini_summary: p.gemini_summary,
    });
  }

  return { mode: "MULTI", selections, remainingGallons: remaining };
}

export async function POST(req: Request) {
  try {
    const { demandId } = await req.json();
    if (!demandId) {
      return NextResponse.json({ error: "Missing demandId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hydrosync");

    // 1) Fetch consumer demand
    const demand = await db.collection("consumer_demands").findOne({ _id: new ObjectId(demandId) });
    if (!demand) {
      return NextResponse.json({ error: "Demand not found" }, { status: 404 });
    }

    const demandQty = Number(demand.quantityNeededGallonsPerDay);
    if (!Number.isFinite(demandQty) || demandQty <= 0) {
      return NextResponse.json({ error: "Invalid demand quantity" }, { status: 400 });
    }

    const consumerLocationStr =
      demand?.location?.city
        ? `${demand.location.city}, ${demand.location.state ?? ""}`
        : (demand.location ?? null);

    // 2) Fetch producer docs
    // ✅ IMPORTANT: set this collection name to where you store producer analysis
    // const PRODUCER_COLLECTION = process.env.PRODUCER_COLLECTION || "producer_reports";
    const PRODUCER_COLLECTION = "lab_reports";

    const producers = await db.collection(PRODUCER_COLLECTION).find({}).toArray();

    // 3) Build the allowed canonical industry list from producers (best!)
    const allCompatible = new Set<string>();
    for (const p of producers) {
      const { industries } = getProducerCompatibleSnake(p);
      industries.forEach((x) => allCompatible.add(x));
      const rec = p?.model_output?.recommended;
      if (rec) allCompatible.add(toSnakeIndustry(String(rec)));
    }
    const allowedSnake = Array.from(allCompatible);
    if (allowedSnake.length === 0) {
      return NextResponse.json({
        success: true,
        demand,
        mode: "MULTI",
        selections: [],
        remainingGallons: demandQty,
        explanation: "No producer compatible industries found in database yet.",
      });
    }

    // 4) Gemini normalize consumer industry -> snake_case canonical (optional but recommended)
    const consumerNeedRaw = String(demand.industryNeed || "");
    const consumerNeedSnake = demand.industryNeedNormalized
      ? toSnakeIndustry(String(demand.industryNeedNormalized))
      : await geminiNormalizeConsumerIndustry(consumerNeedRaw, allowedSnake);

    // 5) Filter producers by compatibility
    const candidates = producers
      .map((p: any) => {
        const { industries, probs } = getProducerCompatibleSnake(p);
        const recSnake = p?.model_output?.recommended ? toSnakeIndustry(String(p.model_output.recommended)) : null;

        const isCompatible = industries.includes(consumerNeedSnake) || recSnake === consumerNeedSnake;

        if (!isCompatible) return null;

        const prob =
          probs[consumerNeedSnake] ??
          (typeof p?.model_output?.confidence === "number" ? Number(p.model_output.confidence) : 0);

        return {
          producerId: String(p._id),
          company_name: p.company_name || "Producer",
          location: p.location || "—",
          availableGallons: Number(p.volume_available_gallons || 0),
          confidence: Number.isFinite(prob) ? prob : 0,
          recommended: p?.model_output?.recommended ?? null,
          compatibleProb: probs[consumerNeedSnake] ?? null,
          gemini_summary: p?.gemini_summary ?? null,
        };
      })
      .filter(Boolean) as any[];

    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        demand: { ...demand, industryNeedNormalized: consumerNeedSnake },
        mode: "MULTI",
        selections: [],
        remainingGallons: demandQty,
        explanation: `No producers found compatible with "${consumerNeedSnake}".`,
      });
    }

    // 6) Distance (Gemini estimation since you currently only have location strings)
    // For hackathon: estimate distance between demand location and producer location.
    // If consumerLocationStr missing, distance is Infinity and sorting will fallback to confidence.
    const scored: any[] = [];
    for (const c of candidates) {
      let distanceKm = Number.POSITIVE_INFINITY;

      if (consumerLocationStr && c.location) {
        distanceKm = await geminiEstimateDistanceKm(String(consumerLocationStr), String(c.location));
      }

      scored.push({ ...c, distanceKm });
    }

    // 7) Allocate supply (single/pair/multi)
    const allocation = allocateBest(demandQty, scored);

    // 8) Return
    return NextResponse.json({
      success: true,
      demand: { ...demand, industryNeedNormalized: consumerNeedSnake },
      mode: allocation.mode,
      selections: allocation.selections,
      remainingGallons: allocation.remainingGallons,
      note:
        "Distance is Gemini-estimated because producer/consumer coordinates are not stored yet. For accuracy, store lat/lng and compute Haversine.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}