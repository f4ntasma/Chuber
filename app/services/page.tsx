import Header from "@/components/header"
import { ProviderDirectory } from "@/components/provider-directory"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-2">Servicios</h1>
        <p className="text-gray-700 dark:text-gray-300">Busca por servicio, ciudad o categoría y contacta directo al profesional.</p>
      </div>
      <ProviderDirectory />
    </div>
  )
}
