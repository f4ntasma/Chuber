"use client"

import { useState } from "react"
import { Moon, Sun, Menu, X, User, Bell, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-200 dark:border-orange-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              ServiConnect
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Inicio
            </a>
            <a
              href="#"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Servicios
            </a>
            <a
              href="#"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Cómo funciona
            </a>
            <a
              href="#"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              Ayuda
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>

            {/* Favorites */}
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem>Mis servicios</DropdownMenuItem>
                <DropdownMenuItem>Historial</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
              Iniciar sesión
            </Button>
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
                href="#"
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
                href="#"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
              >
                Cómo funciona
              </a>
              <a
                href="#"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
              >
                Ayuda
              </a>
              <div className="pt-4 border-t border-orange-200 dark:border-orange-800">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                  Iniciar sesión
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
