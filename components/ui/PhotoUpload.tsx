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
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    if (photos.length + files.length > 3) {
      setError('Maximum 3 photos par annonce')
      return
    }

    setUploading(true)
    setError('')
    const newUrls: string[] = []

    for (const file of files) {
      // Limite à 2MB
      if (file.size > 2 * 1024 * 1024) {
        setError(`${file.name} dépasse 2MB`)
        continue
      }

      const ext = file.name.split('.').pop()
      const filename = `${spaceId}/${Date.now()}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('space-photos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Erreur: ${uploadError.message}`)
        continue
      }

      if (data) {
        const { data: urlData } = supabase.storage
          .from('space-photos')
          .getPublicUrl(filename)
        newUrls.push(urlData.publicUrl)
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

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      <div className="flex gap-3 flex-wrap mb-3">
        {photos.map((url, i) => (
          <div key={i} className="relative w-24 h-24">
            <img src={url} alt={`Photo ${i + 1}`}
              className="w-24 h-24 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={() => handleDelete(url)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < 3 && (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
            {uploading ? (
              <span className="text-xs text-blue-600">Upload...</span>
            ) : (
              <>
                <span className="text-2xl text-gray-400">+</span>
                <span className="text-xs text-gray-400">Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-gray-400">Formats acceptés : JPG, PNG, WebP • Max 2MB par photo</p>
    </div>
  )
}