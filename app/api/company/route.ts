import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";

type CompanyPayload = {
  companyName?: string;
  tradeName?: string;
  panNumber?: string;
  vatNumber?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  streetAddress?: string;
  postalCode?: string;
  fiscalYear?: string;
  taxPeriod?: string;
  vatRate?: number | string;
  currency?: string;
  dateFormat?: string;
  purchasePrefix?: string;
  salesPrefix?: string;
  startingInvoiceNumber?: number | string;
  autoIncrementInvoice?: boolean;
  logoUrl?: string;
  isDefault?: boolean;
};

function normalizeCompanyPayload(payload: CompanyPayload) {
  return {
    companyName: String(payload.companyName || "").trim(),
    tradeName: String(payload.tradeName || "").trim(),
    panNumber: String(payload.panNumber || "").trim(),
    vatNumber: String(payload.vatNumber || "").trim(),
    registrationNumber: String(payload.registrationNumber || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    website: String(payload.website || "").trim(),
    province: String(payload.province || "").trim(),
    district: String(payload.district || "").trim(),
    municipality: String(payload.municipality || "").trim(),
    ward: String(payload.ward || "").trim(),
    streetAddress: String(payload.streetAddress || "").trim(),
    postalCode: String(payload.postalCode || "").trim(),
    fiscalYear: String(payload.fiscalYear || "2082").trim(),
    taxPeriod: String(payload.taxPeriod || "MAGH").trim().toUpperCase(),
    vatRate: Number(payload.vatRate ?? 13),
    currency: String(payload.currency || "NPR").trim().toUpperCase(),
    dateFormat: String(payload.dateFormat || "DD/MM/YYYY").trim(),
    purchasePrefix: String(payload.purchasePrefix || "PUR").trim().toUpperCase(),
    salesPrefix: String(payload.salesPrefix || "SAL").trim().toUpperCase(),
    startingInvoiceNumber: Number(payload.startingInvoiceNumber ?? 1),
    autoIncrementInvoice:
      typeof payload.autoIncrementInvoice === "boolean"
        ? payload.autoIncrementInvoice
        : true,
    logoUrl: String(payload.logoUrl || "").trim(),
    isDefault: true,
  };
}

async function saveDefaultCompany(payload: CompanyPayload) {
  const data = normalizeCompanyPayload(payload);

  if (!data.companyName || !data.panNumber) {
    throw new Error("Company Name and PAN Number are required.");
  }

  return Company.findOneAndUpdate(
    { isDefault: true },
    {
      $set: data,
      $setOnInsert: { isDefault: true },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).lean();
}

export async function GET() {
  try {
    await dbConnect();

    const company = await Company.findOne({ isDefault: true }).lean();

    return NextResponse.json({
      success: true,
      data: company || null,
    });
  } catch (error: any) {
    console.error("Get Company Settings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch company settings.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const payload = (await request.json()) as CompanyPayload;
    const company = await saveDefaultCompany(payload);

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error("Create Company Settings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to save company settings.",
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const payload = (await request.json()) as CompanyPayload;
    const company = await saveDefaultCompany(payload);

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error("Update Company Settings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to save company settings.",
      },
      { status: 400 }
    );
  }
}
