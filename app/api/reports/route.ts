import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";
import PurchaseLedger from "@/models/PurchaseLedger";
import { NEPALI_FISCAL_MONTHS } from "@/lib/vat-period";

type PurchaseLedgerRecord = {
  fiscalYear?: string;
  month?: string;
  taxableAmount?: number;
  vatAmount?: number;
  totalAmount?: number;
};

type ReportSummary = {
  purchaseCount: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const company = await Company.findOne({ isDefault: true }).lean();
    const fiscalYear = (
      searchParams.get("fiscalYear") ||
      company?.fiscalYear ||
      "2082"
    ).trim();

    const purchases = (await PurchaseLedger.find({
      fiscalYear,
    })
      .sort({ date: 1, createdAt: 1 })
      .lean()) as PurchaseLedgerRecord[];

    const monthMap = new Map(
      NEPALI_FISCAL_MONTHS.map((month) => [
        month,
        {
          month,
          purchaseCount: 0,
          taxableAmount: 0,
          vatAmount: 0,
          totalAmount: 0,
        },
      ])
    );

    purchases.forEach((purchase) => {
      const normalizedMonth = String(purchase.month || "").toUpperCase();
      const month = NEPALI_FISCAL_MONTHS.find(
        (entry) => entry === normalizedMonth
      );

      if (!month) return;

      const row = monthMap.get(month)!;
      row.purchaseCount += 1;
      row.taxableAmount += Number(purchase.taxableAmount || 0);
      row.vatAmount += Number(purchase.vatAmount || 0);
      row.totalAmount += Number(purchase.totalAmount || 0);
    });

    const monthlyRows = NEPALI_FISCAL_MONTHS.map((month) => monthMap.get(month)!);

    const summary = purchases.reduce<ReportSummary>(
      (acc, purchase) => {
        acc.purchaseCount += 1;
        acc.taxableAmount += Number(purchase.taxableAmount || 0);
        acc.vatAmount += Number(purchase.vatAmount || 0);
        acc.totalAmount += Number(purchase.totalAmount || 0);
        return acc;
      },
      {
        purchaseCount: 0,
        taxableAmount: 0,
        vatAmount: 0,
        totalAmount: 0,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        fiscalYear,
        companyName: company?.companyName || "",
        taxPeriod: company?.taxPeriod || "",
        summary,
        monthlyRows,
      },
    });
  } catch (error: any) {
    console.error("GET Reports Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load reports.",
      },
      { status: 500 }
    );
  }
}
