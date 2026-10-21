import Link from "next/link"
import Header from "@/components/header"
import { ProviderDirectory } from "@/components/provider-directory"
import { PLAN_PRECIO } from "@/lib/data"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <section className="relative px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Conecta con
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> talentos locales</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Encuentra profesionales cerca de ti para cualquier servicio que necesites. Todos listos para ayudarte.
          </p>
        </div>
      </section>

      <ProviderDirectory />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">¿Ofreces algún servicio?</h2>
            <p className="text-lg mb-6 opacity-90">
              Únete a nuestra comunidad de profesionales y conecta con clientes cerca de ti.
              30 días gratis, luego S/ {PLAN_PRECIO.toFixed(2)} al mes.
            </p>
            <Link href="/register?proveedor=1" className="inline-block rounded-md px-6 py-3 font-semibold bg-white text-orange-600 hover:bg-gray-100">
              Registrarse como proveedor
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
