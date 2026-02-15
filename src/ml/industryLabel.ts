export const INDUSTRY_LABELS: Record<string, string> = {
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

export function getIndustryDisplayName(key: string) {
  return INDUSTRY_LABELS[key] ?? key;
}
