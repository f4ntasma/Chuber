"use client"

import { useState } from "react"
import { Moon, Sun, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Notifications } from "@/components/ui/notifications"
import { Likes } from "@/components/ui/likes"
import Link from "next/link" 
import { useEffect } from "react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<{ name?: string; image?: string; role?: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      const d = await r.json().catch(() => ({}))
      setIsAdmin(d?.user?.role === "admin")
      if (d?.user) {
        // cargar datos completos (nombre/foto)
        const u = await fetch("/api/user").then((x) => x.json()).catch(() => ({}))
        setUser({ name: u?.user?.name, image: u?.user?.image, role: d.user.role })
      } else {
        setUser(null)
      }
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-200 dark:border-orange-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              CHUBERLITE
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/services"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="/pagos"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Pagos
            </Link>
            {isAdmin && (
              <Link
                href="/admin/pagos"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
              >
                Admin
              </Link>
            )}
            <Link
              href="/info"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Quienes somos
            </Link>
            <Link
              href="/Ayuda"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Ayuda
            </Link>
            <Notifications />
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Likes */}
            <Likes />

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <>
                <Link href="/pagos" className="px-3 py-2 rounded-md font-medium border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400">
                  Suscribir a Plan Pro
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full pl-1 pr-3">
                      <span className="relative inline-flex items-center gap-2">
                        <img src={user.image || "/placeholder-user.jpg"} className="h-7 w-7 rounded-full object-cover" />
                        <span className="max-w-[120px] truncate text-sm">{user.name || "Usuario"}</span>
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href="/profile" className="flex items-center px-2 py-1.5 text-sm">
                      <User className="mr-2 h-4 w-4" /> Mi perfil
                    </Link>
                    <Link href="/settings" className="block px-2 py-1.5 text-sm">Configuración</Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => { 
                      await fetch("/api/auth/logout", { method: "POST" })
                      window.location.href = "/" 
                    }}>Cerrar sesión</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-md font-medium">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-md font-medium border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400">
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-orange-200 dark:border-orange-800 py-4">
            <nav className="flex flex-col space-y-4">
              <a
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
              >
                Inicio
              </a>
              <a
                href="#"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
              >
                Servicios
              </a>
              <a
                href="/info"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
              >
                Cómo funciona
              </a>
              <a
                href="/Ayuda"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
              >
                Ayuda
              </a>
              <div className="pt-4 border-t border-orange-200 dark:border-orange-800 grid grid-cols-2 gap-2">
                <a href="/login" className="text-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-md font-medium">
                  Iniciar sesión
                </a>
                <a href="/register" className="text-center border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-md font-medium">
                  Registrarse
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
