import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { recommend } from "@/lib/recommend";
import { getWikimediaThumb, deviceImageUrl } from "@/lib/images";

export const runtime = "nodejs";

/* ---------------- Utils ---------------- */

function normalizeHeader(h: string) {
  return h.toLowerCase().replace(/\s+/g, " ").trim();
}

function findCol(headers: string[], targets: string[]) {
  const norm = headers.map((h) => ({ raw: h, n: normalizeHeader(h) }));
  const tnorm = targets.map((t) => normalizeHeader(t));

  for (const t of tnorm) {
    const hit = norm.find((x) => x.n ==
