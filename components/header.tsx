"use client"

import { useState } from "react"
import Link from "next/link"
import { Moon, Sun, Menu, X, User, MessageCircle, Briefcase, Settings, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Notifications } from "@/components/ui/notifications"
import { Likes } from "@/components/ui/likes"
import { useSesion } from "@/components/session-provider"

const enlaceClase =
  "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, perfil, salir } = useSesion()
  const esAdmin = perfil?.role === "admin"
  const esProveedor = perfil?.role === "provider" || esAdmin

  const enlaces = [
    { href: "/", label: "Inicio" },
    { href: "/services", label: "Servicios" },
    ...(user ? [{ href: "/mensajes", label: "Mensajes" }] : []),
    ...(esProveedor ? [{ href: "/pagos", label: "Mi plan" }] : []),
    ...(esAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    { href: "/info", label: "Quiénes somos" },
    { href: "/Ayuda", label: "Ayuda" },
  ]

  const botonTema = (
    <Button variant="ghost" size="icon" aria-label="Cambiar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-200 dark:border-orange-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              ServiYa
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {enlaces.map((e) => (
              <Link key={e.href} href={e.href} className={enlaceClase}>
                {e.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-2">
            {user && <Notifications />}
            {user && <Likes />}
            {botonTema}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full pl-1 pr-3">
                    <span className="relative inline-flex items-center gap-2">
                      <img src={perfil?.avatar_url || "/placeholder-user.jpg"} alt="" className="h-7 w-7 rounded-full object-cover" />
                      <span className="max-w-[120px] truncate text-sm">{perfil?.name || "Usuario"}</span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" /> Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mensajes"><MessageCircle className="mr-2 h-4 w-4" /> Mensajes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/providers/manage"><Briefcase className="mr-2 h-4 w-4" /> {esProveedor ? "Mi ficha de servicio" : "Ofrecer un servicio"}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Configuración</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={salir}><LogOut className="mr-2 h-4 w-4" /> Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

          <div className="lg:hidden flex items-center space-x-1">
            {user && <Notifications />}
            {botonTema}
            <Button variant="ghost" size="icon" aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t border-orange-200 dark:border-orange-800 py-4">
            <nav className="flex flex-col space-y-4">
              {enlaces.map((e) => (
                <Link key={e.href} href={e.href} className={enlaceClase} onClick={() => setIsMenuOpen(false)}>
                  {e.label}
                </Link>
              ))}
              {user ? (
                <div className="pt-4 border-t border-orange-200 dark:border-orange-800 flex flex-col space-y-4">
                  <Link href="/profile" className={enlaceClase}>Mi perfil</Link>
                  <Link href="/likes" className={enlaceClase}>Mis favoritos</Link>
                  <Link href="/providers/manage" className={enlaceClase}>{esProveedor ? "Mi ficha de servicio" : "Ofrecer un servicio"}</Link>
                  <Link href="/settings" className={enlaceClase}>Configuración</Link>
                  <button type="button" onClick={salir} className={`${enlaceClase} text-left`}>Cerrar sesión</button>
                </div>
              ) : (
                <div className="pt-4 border-t border-orange-200 dark:border-orange-800 grid grid-cols-2 gap-2">
                  <Link href="/login" className="text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-md font-medium">
                    Iniciar sesión
                  </Link>
                  <Link href="/register" className="text-center border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-md font-medium">
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
