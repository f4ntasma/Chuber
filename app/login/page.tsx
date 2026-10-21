import Header from "@/components/header"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; confirmado?: string }> }) {
  const { redirect, confirmado } = await searchParams
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-md p-6 pt-16">
        <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>
        {confirmado && <p className="text-green-700 dark:text-green-400 text-sm mb-4 text-center">Correo confirmado. Ya puedes entrar.</p>}
        <LoginForm redirect={redirect || "/"} />
      </div>
    </div>
  )
}
