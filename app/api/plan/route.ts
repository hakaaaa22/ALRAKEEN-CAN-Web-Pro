import { recommend } from "@/lib/recommend";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return new Response("Missing file", { status: 400 });
  }

  const ab = await file.arrayBuffer();
  const wb = XLSX.read(ab, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];

  if (!rows.length) {
    return new Response("Empty file", { status: 400 });
  }

  const out: any[] = [];

  for (const r of rows) {
    const rec = await recommend(
      String(r.category ?? ""),
      String(r.make ?? ""),
      String(r.model ?? ""),
      Number(r.year ?? undefined)
    );

    out.push({
      ...r,
      "Recommended Device": rec.recommendedDevice,
      "CAN Accessory": rec.canAccessory,
      Rule: rec.rule,
    });
  }

  // Excel
  const wbOut = new ExcelJS.Workbook();
  const sheet = wbOut.addWorksheet("Recommendations");

  sheet.columns = Object.keys(out[0]).map((k) => ({
    header: k,
    key: k,
    width: 25,
  }));

  out.forEach((r) => sheet.addRow(r));
  const excelBuf = await wbOut.xlsx.writeBuffer();

  // PDF
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText("ALRAKEEN – Teltonika CAN Recommendation", {
    x: 40,
    y: 800,
    size: 18,
    font,
    color: rgb(0.1, 0.2, 0.8),
  });

  const pdfBuf = await pdf.save();

  // ZIP
  const zip = new JSZip();
  zip.file("ALRAKEEN_Output.xlsx", excelBuf);
  zip.file("ALRAKEEN_Report.pdf", pdfBuf);

  const zipArray = await zip.generateAsync({ type: "arraybuffer" });

  return new Response(zipArray, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition":
        "attachment; filename=ALRAKEEN_Project_Pack.zip",
    },
  });
}
