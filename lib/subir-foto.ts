import { supabaseBrowser } from "@/lib/supabase/client"

const LADO_MAXIMO = 800

/** Achica la foto a JPG y la sube a avatars/<usuario>/<nombre>.jpg; devuelve la URL pública. */
export async function subirFoto(userId: string, archivo: File, nombre: "perfil" | "servicio") {
  if (!archivo.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen")
  const blob = await reducir(archivo)
  const ruta = `${userId}/${nombre}.jpg`
  const supabase = supabaseBrowser()
  const { error } = await supabase.storage.from("avatars").upload(ruta, blob, { upsert: true, contentType: "image/jpeg" })
  if (error) throw error
  const { data } = supabase.storage.from("avatars").getPublicUrl(ruta)
  return `${data.publicUrl}?v=${Date.now()}` // evita que el navegador muestre la foto anterior
}

function reducir(archivo: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = reject
    img.onload = () => {
      const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height))
      const lienzo = document.createElement("canvas")
      lienzo.width = Math.round(img.width * escala)
      lienzo.height = Math.round(img.height * escala)
      lienzo.getContext("2d")!.drawImage(img, 0, 0, lienzo.width, lienzo.height)
      lienzo.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), "image/jpeg", 0.85)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(archivo)
  })
}
