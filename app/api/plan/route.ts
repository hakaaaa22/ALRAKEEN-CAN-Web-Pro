import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ✅ FIX: use relative imports (works on Linux/Vercel 100%)
import { recommend } from "../../../lib/recommend";
import { getWikimediaThumb, deviceImageUrl } from "../../../lib/images";

export const runtime = "nodejs";

/* ---------------- Utils ---------------- */

function normalizeHeader(h: string) {
  return h.toLowerCase().replace(/\s+/g, " ").trim();
}

function findCol(headers: string[], targets: string[]) {
  const norm = headers.map((h) => ({ raw: h, n: normalizeHeader(h) }));
  const tnorm = targets.map((t) => normalizeHeader(t));

  for (const t of tnorm) {
    const hit = norm.find((x) => x.n === t);
    if (hit) return hit.raw;
  }
  for (const t of tnorm) {
    const hit = norm.find((x) => x.n.includes(t) || t.includes(x.n));
    if (hit) return hit.raw;
  }
  return null;
}

function toInt(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

/* ---------------- API ---------------- */

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return new NextResponse("Missing file", { status: 400 });

  const optionsRaw = (form.get("options") as string) ?? "{}";
  const opt = JSON.parse(optionsRaw);
  const lang = (form.get("lang") as string) ?? "ar";

  /* ---------- Read Excel ---------- */
  const ab = await file.arrayBuffer();
  const wb = XLSX.read(ab, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];

  if (!json.length) return new NextResponse("Empty sheet", { status: 400 });

  const headers = Object.keys(json[0]).map(String);

  const colCat = findCol(headers, ["category", "الفئة", "type"]);
  const colMake = findCol(headers, ["make", "manufacturer", "الشركة"]);
  const colModel = findCol(headers, ["model", "الموديل"]);
  const colYear = findCol(headers, ["year", "سنة الصنع"]);

  const outRows: any[] = [];

  for (const r of json) {
    const category = colCat ? String(r[colCat] ?? "") : "";
    const make = colMake ? String(r[colMake] ?? "") : "";
    const model = colModel ? String(r[colModel] ?? "") : "";
    const year = colYear ? toInt(r[colYear]) : undefined;

    const rec = await recommend(category, make, model, year);

    // ✅ HARDEN: image fetch should never break the route
    let img: string | null = null;
    try {
      const q = `${make} ${model}`.trim();
      img = q ? await getWikimediaThumb(q) : null;
    } catch {
      img = null;
    }

    const deviceUrl = deviceImageUrl(rec.recommendedDevice);

    outRows.push({
      ...r,
      "Recommended Device": rec.recommendedDevice,
      "CAN Accessory": rec.canAccessory,
      "Rule Used": rec.rule,
      "Device URL": deviceUrl ?? "",
      "Vehicle Image": img ?? "",
    });
  }

  /* ---------- Excel Output ---------- */
  const outWb = new ExcelJS.Workbook();
  const sheet = outWb.addWorksheet("Recommendations");

  sheet.columns = Object.keys(outRows[0]).map((k) => ({
    header: k,
    key: k,
    width: Math.min(40, Math.max(14, k.length + 2)),
  }));

  outRows.forEach((r) => sheet.addRow(r));

  const excelBuf = await outWb.xlsx.writeBuffer();
  const excelU8 = new Uint8Array(excelBuf as ArrayBuffer);

  /* ---------- PDF Output ---------- */
  let pdfBytes: Uint8Array | null = null;

  if (opt.includePdf !== false) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawText(
      lang === "ar"
        ? "ALRAKEEN | توصية أجهزة Teltonika CAN"
        : "ALRAKEEN | Teltonika CAN Recommendation",
      { x: 40, y: 800, size: 18, font, color: rgb(0.1, 0.2, 0.8) }
    );

    pdfBytes = await pdf.save();
  }

  /* ---------- ZIP ---------- */
  const zip = new JSZip();
  zip.file("ALRAKEEN_Output.xlsx", excelU8);
  if (pdfBytes) zip.file("ALRAKEEN_Report.pdf", pdfBytes);

  const zipU8 = await zip.generateAsync({ type: "uint8array" });

  return new NextResponse(zipU8, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=ALRAKEEN_Project_Pack.zip",
    },
  });
}
