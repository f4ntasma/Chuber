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
          <li><strong>¿Cómo contacto a un profesional?</strong> En Servicios elige uno y pulsa Contactar para chatear, o usa su WhatsApp desde su ficha.</li>
          <li><strong>¿Cómo guardo a mis favoritos?</strong> Pulsa el corazón en la tarjeta; los verás en el ícono de corazón arriba.</li>
          <li><strong>¿Cómo ofrezco mi servicio?</strong> Regístrate marcando “Quiero ofrecer mis servicios” o, si ya tienes cuenta, entra a “Ofrecer un servicio” en tu menú. Tienes 30 días gratis.</li>
          <li><strong>¿Cómo pago mi plan?</strong> En “Mi plan” escanea el QR con Yape o Plin, paga y registra el número de operación. Te llega una notificación cuando se aprueba.</li>
          <li><strong>Olvidé mi contraseña.</strong> En Iniciar sesión pulsa “¿Olvidaste tu contraseña?” y te enviaremos un enlace al correo.</li>
          <li><strong>¿Cómo activo el modo oscuro?</strong> Usa el botón de sol/luna en la barra superior o ve a Configuración.</li>
        </ul>
      </div>
    </div>
  )
}
