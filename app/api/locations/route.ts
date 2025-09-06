import { NextRequest, NextResponse } from "next/server"

// Pequeño dataset demo Perú. Para completo, se puede ampliar.
const DATA = [
  "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Huancayo", "Iquitos", "Tacna", "Chimbote",
  "Callao", "Pucallpa", "Juliaca", "Cajamarca", "Ayacucho", "Puno", "Tarapoto", "Tumbes", "Ica", "Huaraz",
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("query") || "").toLowerCase()
  const matches = q ? DATA.filter((x) => x.toLowerCase().includes(q)).slice(0, 8) : []
  return NextResponse.json({ suggestions: matches })
}


