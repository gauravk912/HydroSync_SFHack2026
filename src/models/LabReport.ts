import mongoose, { Schema } from "mongoose";

const LabReportSchema = new Schema(
  {
    company_name: { type: String, default: null },
    location: { type: String, default: null },
    producer_industry_type: { type: String, default: null },
    extracted_at: { type: Date, default: Date.now },

    volume_available_gallons: { type: Number, default: null },
    treatment_method: { type: String, default: null },

    ph: { type: Number, default: null },
    temperature_C: { type: Number, default: null },
    turbidity_NTU: { type: Number, default: null },
    color_PtCo: { type: Number, default: null },
    tds_mg_L: { type: Number, default: null },
    tss_mg_L: { type: Number, default: null },
    bod5_mg_L: { type: Number, default: null },
    cod_mg_L: { type: Number, default: null },
    free_chlorine_mg_L: { type: Number, default: null },
    total_coliform_CFU_100mL: { type: Number, default: null },
    hardness_mg_L_as_CaCO3: { type: Number, default: null },
    chloride_mg_L: { type: Number, default: null },
    sulfate_mg_L: { type: Number, default: null },
    silica_mg_L: { type: Number, default: null },
    iron_mg_L: { type: Number, default: null },
    manganese_mg_L: { type: Number, default: null },
    oil_and_grease_mg_L: { type: Number, default: null },
    electrical_conductivity_uS_cm: { type: Number, default: null },

    source_pdf_filename: { type: String, default: null },
    source_pdf_mime: { type: String, default: null },
    source_pdf_url: { type: String, default: null },
  },
  { timestamps: true }
);

export function getLabReportModel(db: mongoose.Connection) {
  return db.models.LabReport || db.model("LabReport", LabReportSchema);
}
