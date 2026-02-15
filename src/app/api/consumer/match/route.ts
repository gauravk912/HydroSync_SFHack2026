import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Producer schema (based on what you pasted)
 * - company_name
 * - location (string)
 * - volume_available_gallons (number)
 * - model_output: { recommended, confidence, top5: [{industry, probability}] }
 * - compatible: string[] (top-level) OR prediction_raw.compatible
 */

/** ---------------- Distance: State centroid (miles) ---------------- */

// Approximate geographic centroids for US states (lat/lng)
const US_STATE_CENTROID: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.806671, lng: -86.79113 },
  AK: { lat: 61.370716, lng: -152.404419 },
  AZ: { lat: 33.729759, lng: -111.431221 },
  AR: { lat: 34.969704, lng: -92.373123 },
  CA: { lat: 36.116203, lng: -119.681564 },
  CO: { lat: 39.059811, lng: -105.311104 },
  CT: { lat: 41.597782, lng: -72.755371 },
  DE: { lat: 39.318523, lng: -75.507141 },
  FL: { lat: 27.766279, lng: -81.686783 },
  GA: { lat: 33.040619, lng: -83.643074 },
  HI: { lat: 21.094318, lng: -157.498337 },
  ID: { lat: 44.240459, lng: -114.478828 },
  IL: { lat: 40.349457, lng: -88.986137 },
  IN: { lat: 39.849426, lng: -86.258278 },
  IA: { lat: 42.011539, lng: -93.210526 },
  KS: { lat: 38.5266, lng: -96.726486 },
  KY: { lat: 37.66814, lng: -84.670067 },
  LA: { lat: 31.169546, lng: -91.867805 },
  ME: { lat: 44.693947, lng: -69.381927 },
  MD: { lat: 39.063946, lng: -76.802101 },
  MA: { lat: 42.230171, lng: -71.530106 },
  MI: { lat: 43.326618, lng: -84.536095 },
  MN: { lat: 45.694454, lng: -93.900192 },
  MS: { lat: 32.741646, lng: -89.678696 },
  MO: { lat: 38.456085, lng: -92.288368 },
  MT: { lat: 46.921925, lng: -110.454353 },
  NE: { lat: 41.12537, lng: -98.268082 },
  NV: { lat: 38.313515, lng: -117.055374 },
  NH: { lat: 43.452492, lng: -71.563896 },
  NJ: { lat: 40.298904, lng: -74.521011 },
  NM: { lat: 34.840515, lng: -106.248482 },
  NY: { lat: 42.165726, lng: -74.948051 },
  NC: { lat: 35.630066, lng: -79.806419 },
  ND: { lat: 47.528912, lng: -99.784012 },
  OH: { lat: 40.388783, lng: -82.764915 },
  OK: { lat: 35.565342, lng: -96.928917 },
  OR: { lat: 44.572021, lng: -122.070938 },
  PA: { lat: 40.590752, lng: -77.209755 },
  RI: { lat: 41.680893, lng: -71.51178 },
  SC: { lat: 33.856892, lng: -80.945007 },
  SD: { lat: 44.299782, lng: -99.438828 },
  TN: { lat: 35.747845, lng: -86.692345 },
  TX: { lat: 31.054487, lng: -97.563461 },
  UT: { lat: 40.150032, lng: -111.862434 },
  VT: { lat: 44.045876, lng: -72.710686 },
  VA: { lat: 37.769337, lng: -78.169968 },
  WA: { lat: 47.400902, lng: -121.490494 },
  WV: { lat: 38.491226, lng: -80.954453 },
  WI: { lat: 44.268543, lng: -89.616508 },
  WY: { lat: 42.755966, lng: -107.30249 },
};

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

function extractStateCode(input: any): string | null {
  if (!input) return null;

  // object form { city, state }
  if (typeof input === "object" && input.state) {
    const st = String(input.state).trim().toUpperCase();
    if (US_STATE_CENTROID[st]) return st;
  }

  const s = String(input).trim();

  // "City, ST" pattern
  const m = s.match(/,\s*([A-Z]{2})(?:\s|$)/);
  if (m && US_STATE_CENTROID[m[1]]) return m[1];

  // state name inside string
  const lower = s.toLowerCase();
  for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
    if (lower.includes(name) && US_STATE_CENTROID[code]) return code;
  }

  return null;
}

function stateCentroidDistanceMiles(fromState: string | null, toState: string | null): number {
  if (!fromState || !toState) return Number.POSITIVE_INFINITY;
  const a = US_STATE_CENTROID[fromState];
  const b = US_STATE_CENTROID[toState];
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return haversineMiles(a, b);
}

/** ---------------- Industry display mapping ---------------- */

const INDUSTRY_DISPLAY: Record<string, string> = {
  cooling_once_through: "Single-Pass Water Cooling System",
  cooling_recirculating_towers: "Recirculating Cooling Tower System",
  boiler_makeup_refinery_feed: "Boiler Feedwater",
  pulp_paper_chemical_unbleached: "Unbleached Kraft Pulp Process Water",
  pulp_paper_bleached: "Bleach Plant Process Water",
  chemical_manufacturing_process: "Chemical Process Utility Water",
  petrochemical_coal_process: "Petrochemical Process Water",
  textiles_sizing_suspension: "Textile Sizing Process Water",
  textiles_scouring_bleach_dye: "Scouring and Dyeing Process Water",
  cement_concrete_aggregate_wash: "Aggregate Wash Water",
};

function toDisplayIndustry(snake: string) {
  const key = (snake || "").trim().toLowerCase();
  return INDUSTRY_DISPLAY[key] ?? key;
}

function normText(s: string) {
  return (s || "").trim().toLowerCase();
}

function toSnakeIndustry(label: string) {
  const x = normText(label);
  if (x.includes("_")) return x.replace(/\s+/g, "_");
  return x
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "_");
}

// Display label -> canonical key
const DISPLAY_TO_CANONICAL: Record<string, string> = Object.fromEntries(
  Object.entries(INDUSTRY_DISPLAY).map(([canonical, display]) => [
    toSnakeIndustry(display),
    canonical,
  ])
);

/** ---------------- Producer compatibility extraction ---------------- */

function getProducerCompatibleSnake(p: any): { industries: string[]; probs: Record<string, number> } {
  const probs: Record<string, number> = {};

  const pr = p?.prediction_raw?.compatible;

  // prediction_raw.compatible could be object array or string array
  if (Array.isArray(pr) && pr.length) {
    if (typeof pr[0] === "object" && pr[0] !== null) {
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

    if (typeof pr[0] === "string") {
      const inds = pr.map((x: string) => toSnakeIndustry(String(x)));
      return { industries: Array.from(new Set(inds)), probs };
    }
  }

  // top-level compatible array (your current DB shape)
  const topCompatible = p?.compatible;
  if (Array.isArray(topCompatible) && topCompatible.length) {
    const inds = topCompatible.map((x: any) => toSnakeIndustry(String(x)));

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

  // fallback older format
  const mo = p?.model_output?.compatible;
  if (Array.isArray(mo) && mo.length) {
    const inds = mo.map((x: any) => toSnakeIndustry(String(x)));

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

/** ---------------- Optional Gemini for industry normalization ---------------- */

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
    const match = allowedSnake.find((x) => x.toLowerCase() === out);
    return match ?? toSnakeIndustry(raw);
  } catch {
    return toSnakeIndustry(raw);
  }
}

/** ---------------- Option builder (SINGLE + PAIR only) ---------------- */

function sortCandidates(scoredCandidates: any[]) {
  return [...scoredCandidates].sort((a, b) => {
    if (a.distanceMiles !== b.distanceMiles) return a.distanceMiles - b.distanceMiles;
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return b.availableGallons - a.availableGallons;
  });
}

function buildSingleOption(demandQty: number, sorted: any[]) {
  const single = sorted.find((p) => p.availableGallons >= demandQty);
  if (!single) return null;

  return {
    mode: "SINGLE" as const,
    selections: [
      {
        producerId: single.producerId,
        company_name: single.company_name,
        location: single.location,
        allocatedGallons: demandQty,
        availableGallons: single.availableGallons,
        distanceMiles: single.distanceMiles,
        confidence: single.confidence,
        recommended: single.recommended,
        compatibleProb: single.compatibleProb,
        gemini_summary: single.gemini_summary,
      },
    ],
    remainingGallons: 0,
  };
}

function buildPairOption(demandQty: number, sorted: any[]) {
  let bestPair: { a: any; b: any; score: number } | null = null;

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const sum = sorted[i].availableGallons + sorted[j].availableGallons;
      if (sum < demandQty) continue;

      const score = (sorted[i].distanceMiles ?? 1e12) + (sorted[j].distanceMiles ?? 1e12);
      if (!bestPair || score < bestPair.score) bestPair = { a: sorted[i], b: sorted[j], score };
    }
  }

  if (!bestPair) return null;

  let remaining = demandQty;
  const allocA = Math.min(bestPair.a.availableGallons, remaining);
  remaining -= allocA;
  const allocB = Math.min(bestPair.b.availableGallons, remaining);
  remaining -= allocB;

  return {
    mode: "PAIR" as const,
    selections: [
      {
        producerId: bestPair.a.producerId,
        company_name: bestPair.a.company_name,
        location: bestPair.a.location,
        allocatedGallons: allocA,
        availableGallons: bestPair.a.availableGallons,
        distanceMiles: bestPair.a.distanceMiles,
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
        distanceMiles: bestPair.b.distanceMiles,
        confidence: bestPair.b.confidence,
        recommended: bestPair.b.recommended,
        compatibleProb: bestPair.b.compatibleProb,
        gemini_summary: bestPair.b.gemini_summary,
      },
    ],
    remainingGallons: remaining,
  };
}

function buildOptions(demandQty: number, scoredCandidates: any[]) {
  const sorted = sortCandidates(scoredCandidates);

  const options = [
    buildSingleOption(demandQty, sorted),
    buildPairOption(demandQty, sorted),
  ].filter(Boolean);

  return { options, ranked: sorted };
}

/** ---------------- Route ---------------- */

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

    // 2) Fetch producers
    const PRODUCER_COLLECTION = process.env.PRODUCER_COLLECTION || "labreports";
    const producers = await db.collection(PRODUCER_COLLECTION).find({}).toArray();

    console.log("[match] producers:", producers.length);

    // 3) Build allowed canonical industries
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
        industryNeedDisplay: demand?.industryNeedNormalized
          ? toDisplayIndustry(toSnakeIndustry(String(demand.industryNeedNormalized)))
          : null,

        options: [],
        rankedProducers: [],

        mode: "PAIR",
        selections: [],
        remainingGallons: demandQty,
        explanation: "No producer compatible industries found in database yet.",
      });
    }

    // 4) Normalize consumer industry
    const consumerNeedRaw = String(demand.industryNeed ?? "");
    const consumerNeedNormRaw = String(demand.industryNeedNormalized ?? "");
    const base = consumerNeedNormRaw || consumerNeedRaw;

    let consumerNeedSnake = DISPLAY_TO_CANONICAL[toSnakeIndustry(base)] ?? "";

    if (!consumerNeedSnake) {
      const baseSnake = toSnakeIndustry(base);
      if (allowedSnake.includes(baseSnake)) consumerNeedSnake = baseSnake;
    }

    if (!consumerNeedSnake) {
      consumerNeedSnake = await geminiNormalizeConsumerIndustry(base, allowedSnake);
    }

    console.log("[match] consumerNeedRaw:", consumerNeedRaw);
    console.log("[match] consumerNeedNormalizedRaw:", consumerNeedNormRaw);
    console.log("[match] consumerNeedSnake:", consumerNeedSnake);

    // 5) Filter compatible producers
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

    console.log("[match] candidates:", candidates.length);

    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        demand: { ...demand, industryNeedNormalized: consumerNeedSnake },
        industryNeedDisplay: toDisplayIndustry(consumerNeedSnake),

        options: [],
        rankedProducers: [],

        mode: "PAIR",
        selections: [],
        remainingGallons: demandQty,
        explanation: `No producers found compatible with "${toDisplayIndustry(consumerNeedSnake)}".`,
      });
    }

    // 6) Distance in miles using state centroids
    const consumerState =
      extractStateCode(demand?.location) ||
      extractStateCode(consumerLocationStr);

    const scored: any[] = [];
    for (const c of candidates) {
      const producerState = extractStateCode(c.location);
      const distanceMiles = stateCentroidDistanceMiles(consumerState, producerState);
      scored.push({ ...c, distanceMiles });
    }

    console.log("[match] consumerState:", consumerState);
    console.log(
      "[match] producerStates sample:",
      scored.slice(0, 5).map((x) => ({
        name: x.company_name,
        st: extractStateCode(x.location),
        mi: x.distanceMiles,
      }))
    );

    // 7) Build options + ranked list
    const { options, ranked } = buildOptions(demandQty, scored);

    // Primary selection for backward-compatible UI
    const primary =
      (options[0] as any) ?? { mode: "PAIR", selections: [], remainingGallons: demandQty };

    // 8) Return
    return NextResponse.json({
      success: true,
      demand: { ...demand, industryNeedNormalized: consumerNeedSnake },
      industryNeedDisplay: toDisplayIndustry(consumerNeedSnake),

      options: options.map((opt: any) => ({
        mode: opt.mode,
        remainingGallons: opt.remainingGallons,
        selections: opt.selections.map((s: any) => ({
          ...s,
          consumerNeedDisplay: toDisplayIndustry(consumerNeedSnake),
          recommendedDisplay: s?.recommended ? toDisplayIndustry(toSnakeIndustry(String(s.recommended))) : null,
        })),
      })),

      rankedProducers: ranked.slice(0, 10).map((p: any) => ({
        producerId: p.producerId,
        company_name: p.company_name,
        location: p.location,
        availableGallons: p.availableGallons,
        distanceMiles: p.distanceMiles,
        confidence: p.confidence,
        recommended: p.recommended,
        recommendedDisplay: p?.recommended ? toDisplayIndustry(toSnakeIndustry(String(p.recommended))) : null,
        compatibleProb: p.compatibleProb ?? null,
      })),

      // Backward compatibility fields (your UI can still read these)
      mode: primary.mode,
      selections: primary.selections.map((s: any) => ({
        ...s,
        consumerNeedDisplay: toDisplayIndustry(consumerNeedSnake),
        recommendedDisplay: s?.recommended ? toDisplayIndustry(toSnakeIndustry(String(s.recommended))) : null,
      })),
      remainingGallons: primary.remainingGallons,

      note:
        "Distance is estimated using US state centroid miles (demo approximation). For production, store lat/lng and compute exact distance.",
    });
  } catch (err: any) {
    console.error("[match] error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
