"use client"
import { useState, useEffect } from "react"

export function LoginCharacter({ email, password, showPassword }: { email: string; password: string; showPassword: boolean }) {
  const [isLooking, setIsLooking] = useState(false)
  const [isCoveringEyes, setIsCoveringEyes] = useState(false)

  useEffect(() => {
    // Seguir con la mirada cuando hay email
    setIsLooking(email.length > 0)
  }, [email])

  useEffect(() => {
    // Taparse los ojos cuando hay contraseña
    setIsCoveringEyes(password.length > 0 && !showPassword)
  }, [password, showPassword])

  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        {/* Cuerpo del personaje */}
        <div className="w-24 h-32 bg-gradient-to-b from-orange-400 to-amber-500 rounded-full relative">
          {/* Cabeza */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-b from-orange-300 to-amber-400 rounded-full">
            {/* Ojos */}
            <div className="absolute top-4 left-3 w-3 h-3 bg-black rounded-full transition-all duration-300"
                 style={{ 
                   transform: isLooking ? 'translateX(2px)' : 'translateX(0)',
                   opacity: isCoveringEyes ? 0.3 : 1 
                 }}>
            </div>
            <div className="absolute top-4 right-3 w-3 h-3 bg-black rounded-full transition-all duration-300"
                 style={{ 
                   transform: isLooking ? 'translateX(-2px)' : 'translateX(0)',
                   opacity: isCoveringEyes ? 0.3 : 1 
                 }}>
            </div>
            
            {/* Manos tapando ojos */}
            {isCoveringEyes && (
              <>
                <div className="absolute top-2 left-1 w-4 h-4 bg-orange-200 rounded-full transform rotate-12"></div>
                <div className="absolute top-2 right-1 w-4 h-4 bg-orange-200 rounded-full transform -rotate-12"></div>
              </>
            )}
            
            {/* Sonrisa */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-3 border-b-2 border-black rounded-full"></div>
          </div>
          
          {/* Brazos */}
          <div className="absolute top-8 left-2 w-3 h-8 bg-gradient-to-b from-orange-300 to-amber-400 rounded-full"></div>
          <div className="absolute top-8 right-2 w-3 h-8 bg-gradient-to-b from-orange-300 to-amber-400 rounded-full"></div>
          
          {/* Piernas */}
          <div className="absolute bottom-0 left-6 w-4 h-6 bg-gradient-to-b from-orange-500 to-amber-600 rounded-full"></div>
          <div className="absolute bottom-0 right-6 w-4 h-6 bg-gradient-to-b from-orange-500 to-amber-600 rounded-full"></div>
        </div>
        
        {/* Burbuja de pensamiento */}
        {isLooking && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-300">¡Hola! 👋</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        )}
      </div>
    </div>
  )
}
