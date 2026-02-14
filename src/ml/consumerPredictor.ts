type ModelBundle = {
  feature_cols: string[];
  scaler: { mean: number[]; scale: number[] };
  models: Array<{ industry: string; coef: number[]; intercept: number; threshold?: number }>;
};

import modelBundleJson from "@/ml/model/consumer_compatibility_model.json";

const modelBundle = modelBundleJson as unknown as ModelBundle;

const featureCols = modelBundle.feature_cols;
const mean = modelBundle.scaler.mean;
const scale = modelBundle.scaler.scale;
const models = modelBundle.models;

function sigmoid(z: number) {
  if (z >= 0) {
    const ez = Math.exp(-z);
    return 1 / (1 + ez);
  } else {
    const ez = Math.exp(z);
    return ez / (1 + ez);
  }
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function buildVector(sample: Record<string, any>) {
  return featureCols.map((f) => {
    const v = sample?.[f];
    return v === undefined || v === null || Number.isNaN(v) ? 0 : Number(v);
  });
}

function scaleVector(x: number[]) {
  const out = new Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const denom = scale[i] === 0 ? 1 : scale[i];
    out[i] = (x[i] - mean[i]) / denom;
  }
  return out;
}

export function predictConsumerIndustries(sample: Record<string, any>, topK = 5) {
  const x = buildVector(sample);
  const xs = scaleVector(x);

  const all = models.map((m) => {
    const z = dot(m.coef, xs) + m.intercept;
    const prob = sigmoid(z);
    const thr = m.threshold ?? 0.5;
    return { industry: m.industry, compatible: prob >= thr ? 1 : 0, prob: Number(prob.toFixed(6)) };
  });

  all.sort((a, b) => (b.compatible - a.compatible) || (b.prob - a.prob));

  const compatible = all.filter(r => r.compatible === 1);
  const rejected = all.filter(r => r.compatible === 0);

  return { top5: compatible.slice(0, topK), compatible, rejected, all };
}
