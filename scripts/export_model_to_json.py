import json
import joblib
import os

# Paths relative to the project root
MODEL_JOBLIB_PATH = os.path.join("src/ml/model", "consumer_compatibility_model.joblib")
OUT_JSON_PATH = os.path.join("src", "ml", "model", "consumer_compatibility_model.json")

bundle = joblib.load(MODEL_JOBLIB_PATH)
pipe = bundle["model"]

feature_cols = bundle["feature_cols"]
industries = bundle["industry_labels"]

scaler = pipe.named_steps["scaler"]
clf = pipe.named_steps["clf"]  # MultiOutputClassifier

# Export one logistic regression per industry
models = []
for ind, est in zip(industries, clf.estimators_):
    models.append({
        "industry": ind,
        "coef": est.coef_[0].tolist(),
        "intercept": float(est.intercept_[0]),
        "threshold": 0.5
    })

out = {
    "feature_cols": feature_cols,
    "industries": industries,
    "scaler": {
        "mean": scaler.mean_.tolist(),
        "scale": scaler.scale_.tolist()
    },
    "models": models
}

os.makedirs(os.path.dirname(OUT_JSON_PATH), exist_ok=True)

with open(OUT_JSON_PATH, "w") as f:
    json.dump(out, f)

print("✅ Exported JSON model to:", OUT_JSON_PATH)
