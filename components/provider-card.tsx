"use client"

import Link from "next/link"
import { Heart, MapPin, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { iniciales, type Proveedor } from "@/lib/data"

export function ProviderCard({
  proveedor,
  distancia,
  favorito,
  onFavorito,
  onContactar,
}: {
  proveedor: Proveedor
  distancia: string
  favorito: boolean
  onFavorito: () => void
  onContactar: () => void
}) {
  const p = proveedor
  return (
    <Card className="group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/proveedor/${p.id}`} className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-800">
              <AvatarImage src={p.image_url || p.avatar_url || undefined} alt={p.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">{iniciales(p.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600">{p.name}</h3>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{p.category}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
            onClick={onFavorito}
            className="text-gray-400 hover:text-red-500"
          >
            <Heart className={`h-4 w-4 ${favorito ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{p.specialty || p.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {p.reviews_count > 0 ? (
              <>
                <span className="text-sm font-medium">{Number(p.rating_avg).toFixed(1)}</span>
                <span className="text-sm text-gray-500">({p.reviews_count})</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Nuevo</span>
            )}
          </div>
          <Badge
            variant={p.available ? "default" : "secondary"}
            className={p.available ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""}
          >
            {p.available ? "Disponible" : "Ocupado"}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{distancia !== "-" ? distancia : [p.district, p.city].filter(Boolean).join(", ") || "Perú"}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{p.response_time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{p.price_range}</span>
          <Button
            onClick={onContactar}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            Contactar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
