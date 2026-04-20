import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";

// ===================== GET =====================
export async function GET() {
  try {
    await connectDB();

    const data = await Transaction.find().sort({ createdAt: -1 });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// ===================== POST =====================
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const newData = await Transaction.create(body);

    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    console.log("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}

// ===================== DELETE =====================
export async function DELETE(req: Request) {
  try {
    await connectDB();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await Transaction.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.log("DELETE Error:", error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}