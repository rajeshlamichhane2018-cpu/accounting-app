import  connectDB from "@/lib/mongodb";
import Due from "@/models/Due";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const data = await Due.find().sort({ createdAt: -1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const newDue = await Due.create(body);

  return NextResponse.json(newDue);
}

export async function PUT(req: Request) {
  await connectDB();
  const { id } = await req.json();

  await Due.findByIdAndUpdate(id, { status: "paid" });

  return NextResponse.json({ success: true });
}