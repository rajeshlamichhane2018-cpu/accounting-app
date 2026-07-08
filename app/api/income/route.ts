import connectDB from "@/lib/mongodb"
import Income from "@/models/Income"

export async function GET() {
  try {
    await connectDB()

    const data = await Income.find().sort({ createdAt: -1 })

    return Response.json(data)
  } catch (error: any) {
    console.error("GET ERROR:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()

    const newIncome = await Income.create({
      title: body.title,
      amount: Number(body.amount),
    })

    return Response.json(newIncome, { status: 201 })
  } catch (error: any) {
    console.error("POST ERROR:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}