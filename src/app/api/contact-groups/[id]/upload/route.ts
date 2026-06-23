import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import Papa from "papaparse";

function normalizePhone(raw: string): string {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length > 7) return `+${digits}`;
  return "";
}

function parsePlainText(text: string): any[] {
  const phoneRegex = /[\+]?[\d][\d\s\-\(\)]{7,}/;
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const rows: any[] = [];
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const phoneMatch = line.match(phoneRegex);
    const emailMatch = line.match(emailRegex);
    const phone = phoneMatch ? phoneMatch[0].replace(/\s/g, "") : "";
    const email = emailMatch ? emailMatch[0] : "";
    let name = line.replace(phoneRegex, "").replace(emailRegex, "").replace(/[,;|]+/g, " ").trim();
    if (!name) name = "Unknown";
    if (phone || email) rows.push({ name, phone, email });
  }
  return rows;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const group = await prisma.contactGroup.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";
  let rawRows: any[] = [];

  if (contentType.includes("application/json")) {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });
    const csvResult = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
    if (csvResult.data.length > 0 && csvResult.meta.fields?.some((f) => /phone/i.test(f))) {
      rawRows = csvResult.data as any[];
    } else {
      rawRows = parsePlainText(text);
    }
  } else {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = file.name.toLowerCase();

    if (filename.endsWith(".csv")) {
      rawRows = Papa.parse(buffer.toString("utf-8"), { header: true, skipEmptyLines: true }).data as any[];
    } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const wb = XLSX.read(buffer, { type: "buffer" });
      rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    } else if (filename.endsWith(".txt")) {
      rawRows = parsePlainText(buffer.toString("utf-8"));
    } else if (filename.endsWith(".pdf")) {
      const text = buffer.toString("latin1").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ");
      rawRows = parsePlainText(text);
    } else {
      rawRows = parsePlainText(buffer.toString("utf-8"));
    }
  }

  if (rawRows.length === 0) {
    return NextResponse.json({ error: "No contacts found. Check your file format." }, { status: 400 });
  }

  const contacts = rawRows
    .map((row) => {
      const phone = normalizePhone(
        row.phone || row.Phone || row.PHONE || row["Phone Number"] ||
        row.mobile || row.Mobile || row.cell || row.Cell || ""
      );
      const name = String(
        row.name || row.Name || row.NAME || row["Full Name"] || "Unknown"
      ).trim();
      const email = String(row.email || row.Email || row.EMAIL || "").trim() || null;
      const company = String(row.company || row.Company || row.COMPANY || "").trim() || null;
      const notes = String(row.notes || row.Notes || row.NOTES || "").trim() || null;
      return phone ? { userId: session.user!.id, contactGroupId: id, name: name || "Unknown", phone, email, company, notes } : null;
    })
    .filter(Boolean) as any[];

  if (contacts.length === 0) {
    return NextResponse.json(
      { error: "No valid phone numbers found. Make sure your data has a phone/mobile column." },
      { status: 400 }
    );
  }

  await prisma.contact.createMany({ data: contacts, skipDuplicates: true });
  return NextResponse.json({ imported: contacts.length, total: rawRows.length });
}
