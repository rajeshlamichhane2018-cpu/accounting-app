import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";
import PurchaseLedger from "@/models/PurchaseLedger";
import { buildPurchaseLedgerWorkbook } from "@/lib/purchase-ledger-export";

const defaultExportCompany = {
  companyName: "TERABYTE LINK PVT. LTD.",
  panNumber: "602444084",
  fiscalYear: "2082",
  taxPeriod: "MAGH",
};

export async function GET() {
  try {
    await dbConnect();

    const purchases = await PurchaseLedger.find({})
      .sort({ date: 1, createdAt: 1 })
      .lean();

    const company = await Company.findOne({ isDefault: true }).lean();
    const exportCompany = company || defaultExportCompany;

    const workbook = await buildPurchaseLedgerWorkbook({
      rows: purchases,
      companyName: exportCompany.companyName || "",
      panNo: exportCompany.panNumber || "",
      fiscalYear: exportCompany.fiscalYear || "",
      month: exportCompany.taxPeriod || "",
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Purchase-Ledger.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Export Purchase Ledger Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to export purchase ledger.",
      },
      { status: 500 }
    );
  }
}
