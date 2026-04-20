import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const data = await Transaction.find().sort({ date: -1 });

    return NextResponse.json(data || []);
  } catch (error) {
    console.log(error);
    return NextResponse.json([], { status: 200 }); // fallback
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const newData = await Transaction.create(body);

    return NextResponse.json(newData);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    await Transaction.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}