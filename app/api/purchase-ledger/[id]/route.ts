import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PurchaseLedger from "@/models/PurchaseLedger";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await req.json();

    const updatedPurchase = await PurchaseLedger.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPurchase) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase entry not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Purchase updated successfully.",
      data: updatedPurchase,
    });
  } catch (error: any) {
    console.error("PUT Purchase Ledger Error:", error);

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
        message: error.message || "Failed to update purchase.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const deletedPurchase = await PurchaseLedger.findByIdAndDelete(id);

    if (!deletedPurchase) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase entry not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Purchase deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE Purchase Ledger Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete purchase.",
      },
      { status: 500 }
    );
  }
}
