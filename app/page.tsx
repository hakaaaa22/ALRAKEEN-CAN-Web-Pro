"use client";
import { useMemo, useState } from "react";
type Lang = "ar" | "en";
const t = (lang: Lang) => ({
  title: lang === "ar" ? "ALRAKEEN | نظام توصية Teltonika CAN" : "ALRAKEEN | Teltonika CAN Recommender",
  subtitle: lang === "ar" ? "ارفع ملف Excel وسيتم إنشاء توصية أجهزة + خطة تركيب + تقرير PDF/Excel داخل ملف ZIP."
    : "Upload an Excel file to generate device recommendations, installation plan, and PDF/Excel pack (ZIP).",
  upload: lang === "ar" ? "رفع ملف Excel" : "Upload Excel",
  options: lang === "ar" ? "خيارات التقرير" : "Report options",
  rec: lang === "ar" ? "توصيات الأجهزة" : "Recommendations",
  plan: lang === "ar" ? "خطة التركيب" : "Installation plan",
  cost: lang === "ar" ? "التكاليف" : "Costs",
  pdf: lang === "ar" ? "تقرير PDF" : "PDF report",
  start: lang === "ar" ? "إنشاء التقرير" : "Generate",
  downloading: lang === "ar" ? "جاري التحضير..." : "Preparing...",
  help: lang === "ar" ? "يدعم تلقائياً قراءة الأعمدة العربية/الإنجليزية (الموقع/المالك/البيان/الشركة/الموديل/سنة الصنع)."
    : "Auto-detects Arabic/English columns (location/owner/description/make/model/year).",
  tech: lang === "ar" ? "عدد الفنيين" : "Technicians",
  hours: lang === "ar" ? "ساعات العمل/اليوم" : "Hours/day",
  minutes: lang === "ar" ? "دقائق لكل مركبة" : "Minutes/vehicle",
  startDate: lang === "ar" ? "تاريخ البداية" : "Start date",
  regionBy: lang === "ar" ? "التخطيط حسب" : "Plan by",
  byLoc: lang === "ar" ? "الموقع" : "Location",
  byOwner: lang === "ar" ? "المالك" : "Owner",
  km: lang === "ar" ? "KM/Day" : "KM/Day",
  fuelPrice: lang === "ar" ? "سعر الوقود" : "Fuel price",
  l100: lang === "ar" ? "L/100KM" : "L/100KM",
  techDay: lang === "ar" ? "تكلفة الفني/يوم" : "Tech/day cost",
  perDiem: lang === "ar" ? "بدل يومي/فني" : "Per diem/tech",
  hotelNight: lang === "ar" ? "تكلفة فندق/ليلة" : "Hotel/night",
  hotelNights: lang === "ar" ? "ليالي/يوم" : "Nights/day",
});
export default function Home(){
  const [lang,setLang]=useState<Lang>("ar");
  const L=useMemo(()=>t(lang),[lang]);
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [includeRecommendations,setIncludeRecommendations]=useState(true);
  const [includePlan,setIncludePlan]=useState(true);
  const [includeCost,setIncludeCost]=useState(false);
  const [includePdf,setIncludePdf]=useState(true);
  const [planBy,setPlanBy]=useState<"location"|"owner">("location");
  const [techCount,setTechCount]=useState(2);
  const [hoursPerDay,setHoursPerDay]=useState(8);
  const [minutesPerVehicle,setMinutesPerVehicle]=useState(35);
  const [startDate,setStartDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [kmPerDay,setKmPerDay]=useState(120);
  const [fuelPrice,setFuelPrice]=useState(2.18);
  const [fuelLitersPer100km,setFuelLitersPer100km]=useState(18);
  const [technicianDailyCost,setTechnicianDailyCost]=useState(350);
  const [perDiemDaily,setPerDiemDaily]=useState(120);
  const [hotelCostPerNight,setHotelCostPerNight]=useState(260);
  const [hotelNightsPerDay,setHotelNightsPerDay]=useState(1);

  async function onGenerate(){
    if(!file) return;
    setBusy(true);
    try{
      const form=new FormData();
      form.append("file",file);
      form.append("lang",lang);
      form.append("options",JSON.stringify({
        includeRecommendations,includePlan,includeCost,includePdf,planBy,
        techCount,hoursPerDay,installsPerVehicleMinutes:minutesPerVehicle,startDate,
        kmPerDay,fuelPrice,fuelLitersPer100km,technicianDailyCost,perDiemDaily,hotelCostPerNight,hotelNightsPerDay
      }));
      const res=await fetch("/api/plan",{method:"POST",body:form});
      if(!res.ok) throw new Error(await res.text());
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download="ALRAKEEN_Project_Pack.zip";
      document.body.appendChild(a);a.click();a.remove();
      URL.revokeObjectURL(url);
    }catch(e:any){alert(e?.message||"Error")}
    finally{setBusy(false)}
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,var(--blue),var(--blue2))"}}/>
          <div>
            <div style={{fontSize:18,fontWeight:800}}>{L.title}</div>
            <div style={{color:"var(--muted)",fontSize:13}}>{L.subtitle}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span className="badge">{lang==="ar"?"عربي":"English"}</span>
          <button className="btn2" onClick={()=>setLang(lang==="ar"?"en":"ar")}>{lang==="ar"?"EN":"AR"}</button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div className="col">
            <label>{L.upload}</label>
            <input className="input" type="file" accept=".xlsx,.xls,.csv" onChange={(e)=>setFile(e.target.files?.[0]??null)} />
            <div className="footer">{L.help}</div>
          </div>
          <div className="col">
            <label>{L.options}</label>
            <div className="checkbox"><input type="checkbox" checked={includeRecommendations} onChange={(e)=>setIncludeRecommendations(e.target.checked)} /> <span>{L.rec}</span></div>
            <div className="checkbox"><input type="checkbox" checked={includePlan} onChange={(e)=>setIncludePlan(e.target.checked)} /> <span>{L.plan}</span></div>
            <div className="checkbox"><input type="checkbox" checked={includeCost} onChange={(e)=>setIncludeCost(e.target.checked)} /> <span>{L.cost}</span></div>
            <div className="checkbox"><input type="checkbox" checked={includePdf} onChange={(e)=>setIncludePdf(e.target.checked)} /> <span>{L.pdf}</span></div>
            <hr/>
            <label>{L.regionBy}</label>
            <div className="row">
              <button className={planBy==="location"?"btn":"btn2"} onClick={()=>setPlanBy("location")}>{L.byLoc}</button>
              <button className={planBy==="owner"?"btn":"btn2"} onClick={()=>setPlanBy("owner")}>{L.byOwner}</button>
            </div>
          </div>
        </div>

        <hr/>

        <div className="row">
          <div className="col"><label>{L.tech}</label><input className="input" type="number" min={1} value={techCount} onChange={(e)=>setTechCount(Number(e.target.value||1))} /></div>
          <div className="col"><label>{L.hours}</label><input className="input" type="number" min={1} value={hoursPerDay} onChange={(e)=>setHoursPerDay(Number(e.target.value||8))} /></div>
          <div className="col"><label>{L.minutes}</label><input className="input" type="number" min={10} value={minutesPerVehicle} onChange={(e)=>setMinutesPerVehicle(Number(e.target.value||35))} /></div>
          <div className="col"><label>{L.startDate}</label><input className="input" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></div>
        </div>

        {includeCost && (
          <>
            <hr/>
            <div className="row">
              <div className="col"><label>{L.km}</label><input className="input" type="number" min={0} value={kmPerDay} onChange={(e)=>setKmPerDay(Number(e.target.value||0))} /></div>
              <div className="col"><label>{L.fuelPrice}</label><input className="input" type="number" min={0} step="0.01" value={fuelPrice} onChange={(e)=>setFuelPrice(Number(e.target.value||0))} /></div>
              <div className="col"><label>{L.l100}</label><input className="input" type="number" min={0} step="0.1" value={fuelLitersPer100km} onChange={(e)=>setFuelLitersPer100km(Number(e.target.value||0))} /></div>
              <div className="col"><label>{L.techDay}</label><input className="input" type="number" min={0} value={technicianDailyCost} onChange={(e)=>setTechnicianDailyCost(Number(e.target.value||0))} /></div>
              <div className="col"><label>{L.perDiem}</label><input className="input" type="number" min={0} value={perDiemDaily} onChange={(e)=>setPerDiemDaily(Number(e.target.value||0))} /></div>
              <div className="col"><label>{L.hotelNight}</label><input className="input" type="number" min={0} value={hotelCostPerNight} onChange={(e)=>setHotelCostPerNight(Number(e.target.value||0))} /></div>
              <div className="col"><label>{L.hotelNights}</label><input className="input" type="number" min={0} value={hotelNightsPerDay} onChange={(e)=>setHotelNightsPerDay(Number(e.target.value||0))} /></div>
            </div>
          </>
        )}

        <hr/>
        <button className="btn" disabled={!file||busy} onClick={onGenerate}>{busy?L.downloading:L.start}</button>
        <div className="footer">© ALRAKEEN — Web Pro</div>
      </div>
    </div>
  );
}
