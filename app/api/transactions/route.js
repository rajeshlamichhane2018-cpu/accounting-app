import { getDB } from "@/lib/db";

export async function GET() {
  const db = await getDB();
  const data = await db.all("SELECT * FROM transactions");
  return Response.json(data);
}

export async function POST(req) {
  const db = await getDB();
  const body = await req.json();

  await db.run(
    "INSERT INTO transactions (date, account, type, amount, description) VALUES (?, ?, ?, ?, ?)",
    [body.date, body.account, body.type, body.amount, body.description]
  );

  return Response.json({ success: true });
}

export async function DELETE(req) {
  const db = await getDB();
  const { id } = await req.json();

  await db.run("DELETE FROM transactions WHERE id = ?", [id]);

  return Response.json({ success: true });
}

export async function PUT(req) {
  const db = await getDB();
  const body = await req.json();

  await db.run(
    `UPDATE transactions 
     SET particulars=?, receipt=?, payment=?, remarks=? 
     WHERE id=?`,
    [
      body.particulars,
      body.receipt,
      body.payment,
      body.remarks,
      body.id
    ]
  );

  return Response.json({ success: true });
}