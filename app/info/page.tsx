import Header from "@/components/header"

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">¿Quiénes somos?</h1>
        <p className="text-gray-700 dark:text-gray-300">
          En CHUBERLITE conectamos clientes con talentos locales de forma simple y rápida.
          Nuestro objetivo es impulsar a emprendedores independientes y facilitar que más personas
          encuentren servicios de calidad cerca de casa.
        </p>
      </div>
    </div>
  )
}