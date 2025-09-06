"use client"

import Header from "@/components/header"

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <h1 className="text-3xl font-bold">Ayuda</h1>
        <p className="text-gray-700 dark:text-gray-300">Encuentra respuestas rápidas a preguntas frecuentes.</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>¿Cómo me registro como proveedor? Ve a Registro y marca proveedor.</li>
          <li>¿Cómo contacto a un profesional? En Servicios, elige uno y presiona Contactar.</li>
          <li>¿Cómo activo el modo oscuro? Usa el botón en la barra superior.</li>
        </ul>
      </div>
    </div>
  )
}
