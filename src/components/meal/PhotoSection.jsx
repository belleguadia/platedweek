import { useRef, useState } from 'react'
import { uploadMealPhoto } from '../../lib/api'

export default function PhotoSection({ meal, onPhotoUpdated }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const updated = await uploadMealPhoto(meal.id, file)
      onPhotoUpdated(updated)
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <section className="section-divider py-8">
      <h2 className="label-tag mb-4">Photo</h2>

      {meal.photo_url ? (
        <div className="mb-4 overflow-hidden rounded-[2px] border border-separator">
          <img
            src={meal.photo_url}
            alt={meal.title}
            className="max-h-80 w-full object-cover"
          />
        </div>
      ) : (
        <p className="mb-4 text-sm text-disabled">No photo yet</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="meal-photo-input"
      />
      <label htmlFor="meal-photo-input" className="btn-outline cursor-pointer">
        {uploading ? 'Uploading…' : meal.photo_url ? 'Replace photo' : 'Upload photo'}
      </label>
    </section>
  )
}
