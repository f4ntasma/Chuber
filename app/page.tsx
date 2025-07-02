"use client"

import { useState } from "react"
import {
  Search,
  MapPin,
  Star,
  Clock,
  Heart,
  Wrench,
  Music,
  Cake,
  Paintbrush,
  Camera,
  Scissors,
  Car,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "@/components/header"

const categories = [
  { name: "Carpintería", icon: Wrench, color: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" },
  { name: "Fontanería", icon: Wrench, color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
  {
    name: "DJ & Música",
    icon: Music,
    color: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  },
  { name: "Repostería", icon: Cake, color: "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300" },
  { name: "Pintura", icon: Paintbrush, color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" },
  {
    name: "Fotografía",
    icon: Camera,
    color: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300",
  },
  { name: "Peluquería", icon: Scissors, color: "bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300" },
  { name: "Mecánica", icon: Car, color: "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300" },
]

const providers = [
  {
    id: 1,
    name: "María González",
    service: "Repostería Artesanal",
    rating: 4.9,
    reviews: 127,
    price: "$15-30",
    distance: "0.8 km",
    image: "/placeholder.svg?height=60&width=60",
    specialty: "Tortas personalizadas y cupcakes",
    available: true,
    responseTime: "15 min",
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    service: "Carpintería",
    rating: 4.8,
    reviews: 89,
    price: "$25-50",
    distance: "1.2 km",
    image: "/placeholder.svg?height=60&width=60",
    specialty: "Muebles a medida y reparaciones",
    available: true,
    responseTime: "30 min",
  },
  {
    id: 3,
    name: "DJ Alex",
    service: "Música y Entretenimiento",
    rating: 4.7,
    reviews: 156,
    price: "$80-150",
    distance: "2.1 km",
    image: "/placeholder.svg?height=60&width=60",
    specialty: "Fiestas, bodas y eventos",
    available: false,
    responseTime: "1 hora",
  },
  {
    id: 4,
    name: "Ana Rodríguez",
    service: "Fontanería",
    rating: 4.9,
    reviews: 203,
    price: "$20-40",
    distance: "0.5 km",
    image: "/placeholder.svg?height=60&width=60",
    specialty: "Reparaciones urgentes 24/7",
    available: true,
    responseTime: "20 min",
  },
  {
    id: 5,
    name: "Luis Painter",
    service: "Pintura Decorativa",
    rating: 4.6,
    reviews: 74,
    price: "$30-60",
    distance: "1.8 km",
    image: "/placeholder.svg?height=60&width=60",
    specialty: "Murales y decoración interior",
    available: true,
    responseTime: "45 min",
  },
  {
    id: 6,
    name: "Sofia Lens",
    service: "Fotografía",
    rating: 4.8,
    reviews: 92,
    price: "$50-120",
    distance: "1.5 km",
    image: "/placeholder.svg?height=60&width=60",
    specialty: "Retratos y eventos familiares",
    available: true,
    responseTime: "2 horas",
  },
]

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || provider.service.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Conecta con
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {" "}
              talentos locales
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Encuentra profesionales cerca de ti para cualquier servicio que necesites. Desde carpinteros hasta DJs,
            todos listos para ayudarte.
          </p>

          {/* Search Bar */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="¿Qué servicio necesitas?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base border-2 border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Tu ubicación"
                className="pl-10 h-12 text-base border-2 border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600 sm:w-48"
              />
            </div>
            <Button className="h-12 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold">
              Buscar
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Explora por categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Card
                  key={category.name}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    selectedCategory === category.name ? "ring-2 ring-orange-400" : ""
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-2`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Service Providers */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profesionales disponibles</h2>
            <p className="text-gray-600 dark:text-gray-400">{filteredProviders.length} servicios encontrados</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-800">
                        <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                          {provider.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{provider.service}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(provider.id)
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.includes(provider.id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{provider.specialty}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{provider.rating}</span>
                      <span className="text-sm text-gray-500">({provider.reviews})</span>
                    </div>
                    <Badge
                      variant={provider.available ? "default" : "secondary"}
                      className={
                        provider.available ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""
                      }
                    >
                      {provider.available ? "Disponible" : "Ocupado"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{provider.distance}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{provider.responseTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{provider.price}</span>
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">¿Ofreces algún servicio?</h2>
            <p className="text-lg mb-6 opacity-90">
              Únete a nuestra comunidad de profesionales y conecta con clientes cerca de ti
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
              Registrarse como proveedor
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
