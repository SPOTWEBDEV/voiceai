import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import Papa from "papaparse";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  let rows: any[] = [];

  if (file.name.endsWith(".csv")) {
    const text = buffer.toString("utf-8");
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    rows = result.data as any[];
  } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet);
  } else {
    return NextResponse.json({ error: "Only CSV and XLSX files are supported" }, { status: 400 });
  }

  const contacts = rows
    .filter((row) => row.phone || row.Phone || row.PHONE)
    .map((row) => ({
      userId: session.user!.id,
      name: row.name || row.Name || row.NAME || "Unknown",
      phone: normalizePhone(String(row.phone || row.Phone || row.PHONE)),
      email: row.email || row.Email || row.EMAIL || null,
      company: row.company || row.Company || row.COMPANY || null,
      notes: row.notes || row.Notes || row.NOTES || null,
    }));

  if (contacts.length === 0) return NextResponse.json({ error: "No valid contacts found. Make sure your file has a 'phone' column." }, { status: 400 });

  await prisma.contact.createMany({ data: contacts, skipDuplicates: true });
  return NextResponse.json({ imported: contacts.length });
}
