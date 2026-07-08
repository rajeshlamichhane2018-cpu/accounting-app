import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // आफ्नो DB connection path अनुसार change गर
import PurchaseLedger from "@/models/PurchaseLedger";

// GET - All Purchase Ledger
export async function GET() {
  try {
    await dbConnect();

    const purchases = await PurchaseLedger.find({})
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error: any) {
    console.error("GET Purchase Ledger Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch purchase ledger.",
      },
      { status: 500 }
    );
  }
}

// POST - Create Purchase Entry
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const purchaseData = {
      ...body,
      ...(body.companyId ? { companyId: body.companyId } : {}),
    };

    const purchase = await PurchaseLedger.create(purchaseData);

    return NextResponse.json(
      {
        success: true,
        message: "Purchase saved successfully.",
        data: purchase,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Purchase Ledger Error:", error);

    // Duplicate invoice
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to save purchase.",
      },
      { status: 500 }
    );
  }
}
