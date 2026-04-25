'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  spaceId: string
  existingPhotos: string[]
  onUpdate: (urls: string[]) => void
}

export default function PhotoUpload({ spaceId, existingPhotos, onUpdate }: Props) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      img.onload = () => {
        const maxSize = 800
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.75)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (photos.length + files.length > 3) {
      alert('Maximum 3 photos par annonce')
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    for (const file of files) {
      const compressed = await compressImage(file)
      const filename = `${spaceId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('space-photos')
        .upload(filename, compressed, { contentType: 'image/jpeg' })

      if (!error) {
        const { data } = supabase.storage
          .from('space-photos')
          .getPublicUrl(filename)
        newUrls.push(data.publicUrl)
      }
    }

    const updated = [...photos, ...newUrls]
    setPhotos(updated)
    onUpdate(updated)
    setUploading(false)
  }

  const handleDelete = async (url: string) => {
    const path = url.split('/space-photos/')[1]
    await supabase.storage.from('space-photos').remove([path])
    const updated = photos.filter(p => p !== url)
    setPhotos(updated)
    onUpdate(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photos ({photos.length}/3)
      </label>

      <div className="flex gap-3 flex-wrap mb-3">
        {photos.map((url, i) => (
          <div key={i} className="relative w-24 h-24">
            <img src={url} alt={`Photo ${i+1}`}
              className="w-24 h-24 object-cover rounded-lg border" />
            <button
              onClick={() => handleDelete(url)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < 3 && (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
            <span className="text-2xl text-gray-400">+</span>
            <span className="text-xs text-gray-400">Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {uploading && (
        <p className="text-sm text-blue-600">Upload en cours...</p>
      )}
    </div>
  )
}