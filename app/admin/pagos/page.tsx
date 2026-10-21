import { redirect } from "next/navigation"

// El panel de pagos ahora vive dentro de /admin
export default function AdminPagosPage() {
  redirect("/admin")
}
