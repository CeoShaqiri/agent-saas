import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Lead = {
  id: number;
  name?: string;
  email: string;
  company?: string;
  notes?: string;
  createdAt: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, notes } = body as Partial<Lead> & {
      email?: string;
    };
    if (!email)
      return NextResponse.json({ error: "email is required" }, { status: 400 });

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const file = path.join(dataDir, "leads.json");

    let leads: Lead[] = [];
    if (fs.existsSync(file)) {
      try {
        const raw = fs.readFileSync(file, "utf8");
        leads = raw ? JSON.parse(raw) : [];
      } catch (e) {
        leads = [];
      }
    }

    const lead: Lead = {
      id: Date.now(),
      name: name || "",
      email: email,
      company: company || "",
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };

    leads.push(lead);
    fs.writeFileSync(file, JSON.stringify(leads, null, 2));

    return NextResponse.json({ ok: true, lead });
  } catch (err: any) {
    return NextResponse.json(
      { error: "server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
