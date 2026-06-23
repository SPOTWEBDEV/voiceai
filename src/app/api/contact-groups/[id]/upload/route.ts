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

// Parse plain text / paste: one contact per line
// Tries to extract phone, name, email from each line
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
    // Strip phone and email from line to get the name
    let name = line.replace(phoneRegex, "").replace(emailRegex, "").replace(/[,;|]+/g, " ").trim();
    if (!name) name = "Unknown";
    if (phone || email) rows.push({ name, phone, email });
  }
  return rows;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify group belongs to user
  const group = await prisma.contactGroup.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";
  let rawRows: any[] = [];

  // ── JSON paste (text pasted in textarea) ──────────────────────────────────
  if (contentType.includes("application/json")) {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    // Try CSV parse first, fallback to plain text
    const csvResult = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
    if (csvResult.data.length > 0 && csvResult.meta.fields?.some((f) => /phone/i.test(f))) {
      rawRows = csvResult.data as any[];
    } else {
      rawRows = parsePlainText(text);
    }
  }
  // ── File upload ────────────────────────────────────────────────────────────
  else {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = file.name.toLowerCase();

    if (filename.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      rawRows = result.data as any[];
    } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rawRows = XLSX.utils.sheet_to_json(sheet);
    } else if (filename.endsWith(".txt")) {
      rawRows = parsePlainText(buffer.toString("utf-8"));
    } else if (filename.endsWith(".pdf")) {
      // Basic PDF text extraction without heavy deps
      const text = buffer.toString("latin1");
      const readable = text.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ");
      rawRows = parsePlainText(readable);
    } else {
      // Try as plain text for any other format
      rawRows = parsePlainText(buffer.toString("utf-8"));
    }
  }

  if (rawRows.length === 0) {
    return NextResponse.json({ error: "No contacts found. Check your file format." }, { status: 400 });
  }

  // Normalize rows to contacts
  const contacts = rawRows
    .map((row) => {
      const phone = normalizePhone(
        row.phone || row.Phone || row.PHONE ||
        row["Phone Number"] || row["phone number"] ||
        row.mobile || row.Mobile || row.cell || row.Cell || ""
      );
      const name =
        row.name || row.Name || row.NAME ||
        row["Full Name"] || row["full name"] ||
        row.fullname || row.FullName || "Unknown";
      const email =
        row.email || row.Email || row.EMAIL ||
        row["Email Address"] || "";
      const company =
        row.company || row.Company || row.COMPANY ||
        row.organization || row.Organization || "";
      const notes =
        row.notes || row.Notes || row.NOTES ||
        row.comment || row.Comment || "";

      return phone ? {
        userId: session.user!.id,
        contactGroupId: params.id,
        name: String(name).trim() || "Unknown",
        phone,
        email: email ? String(email).trim() : null,
        company: company ? String(company).trim() : null,
        notes: notes ? String(notes).trim() : null,
      } : null;
    })
    .filter(Boolean) as any[];

  if (contacts.length === 0) {
    return NextResponse.json({
      error: "No valid phone numbers found. Make sure your data has a phone/mobile column or phone numbers in the text.",
    }, { status: 400 });
  }

  await prisma.contact.createMany({ data: contacts, skipDuplicates: true });

  return NextResponse.json({ imported: contacts.length, total: rawRows.length });
}
