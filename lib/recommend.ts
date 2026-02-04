type Rec = {
  recommendedDevice: string;
  canAccessory: string;
  supportedAdapters: string;
  allOptions: string;
  rule: string;
};
function norm(s: string) { return (s||"").toUpperCase().replace(/\s+/g," ").trim(); }
export async function recommend(category?: string, make?: string, model?: string, year?: number): Promise<Rec> {
  const cat = norm(category||"");
  const mk = norm(make||"");
  const md = norm(model||"");
  if (cat.includes("HEAVY") || /ACTROS|HOWO|X3000|SHACMAN|SINOTRUK|MERCEDES/.test(mk+" "+md)) {
    return {
      recommendedDevice: "FMC650",
      canAccessory: "LV-CAN200 / ALL-CAN300 (حسب المركبة)",
      supportedAdapters: "LV-CAN200, ALL-CAN300, ECAN02 (إذا لزم)",
      allOptions: "FMC650 | FMC150 + CAN adapter | FMB140 + CAN adapter",
      rule: "HEAVY → FMC650"
    };
  }
  if (/TOYOTA|HYUNDAI|KIA|NISSAN|ISUZU/.test(mk)) {
    return {
      recommendedDevice: "FMC150",
      canAccessory: "LV-CAN200 / ALL-CAN300 (حسب المركبة)",
      supportedAdapters: "LV-CAN200, ALL-CAN300",
      allOptions: "FMC150 | FMM150 | FMB140 (+ CAN adapter)",
      rule: "LIGHT → FMC150"
    };
  }
  return {
    recommendedDevice: "FMC150",
    canAccessory: "CAN adapter عند الحاجة لقراءة CAN",
    supportedAdapters: "LV-CAN200, ALL-CAN300",
    allOptions: "FMC150 | FMC650 (للهيفي) | FMB140",
    rule: "DEFAULT → FMC150"
  };
}
