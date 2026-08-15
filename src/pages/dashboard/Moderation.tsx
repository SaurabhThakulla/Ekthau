import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X, Trash2, ArrowLeft } from 'lucide-react'

import { MOCK_MODE, mockMedia } from '@/lib/mockData'

interface Media {
  id: string
  storage_path: string
  mime_type: string
  status: string
  created_at: string
}

export default function Moderation() {
  const { id } = useParams()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)

  const loadMedia = useCallback(async () => {
    if (!id) return
    setLoading(true)

    if (MOCK_MODE) {
      setMedia(mockMedia as any)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('media')
      .select('id, storage_path, mime_type, status, created_at')
      .eq('event_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      
    if (!error && data) {
      setMedia(data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const updateStatus = async (mediaId: string, newStatus: string) => {
    const { error } = await supabase
      .from('media')
      .update({ status: newStatus })
      .eq('id', mediaId)
      
    if (!error) {
      setMedia(prev => prev.map(m => m.id === mediaId ? { ...m, status: newStatus } : m))
    }
  }

  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    const { error } = await supabase
      .from('media')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', mediaId)
      
    if (!error) {
      setMedia(prev => prev.filter(m => m.id !== mediaId))
    }
  }

  const getMediaUrl = (storagePath: string) => {
    const publicDomain = import.meta.env.VITE_R2_PUBLIC_DOMAIN
    return publicDomain ? `https://${publicDomain}/${storagePath}` : `/mock-storage/${storagePath}`
  }

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/dashboard/events/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Moderate Media</h1>
      </div>

      {media.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg">
          No media found for this event.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden flex flex-col bg-card">
              <div className="aspect-square bg-gray-100 dark:bg-zinc-800 relative">
                {item.mime_type.startsWith('video/') ? (
                  <video src={getMediaUrl(item.storage_path)} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={getMediaUrl(item.storage_path)} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1 text-xs text-white uppercase font-bold">
                  {item.status}
                </div>
              </div>
              
              <div className="p-3 flex justify-between gap-2">
                {item.status === 'pending' || item.status === 'rejected' ? (
                  <Button size="sm" variant="outline" className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/30 dark:text-green-400" onClick={() => updateStatus(item.id, 'approved')}>
                    <Check className="h-4 w-4" />
                  </Button>
                ) : null}
                
                {item.status === 'pending' || item.status === 'approved' ? (
                  <Button size="sm" variant="outline" className="flex-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" onClick={() => updateStatus(item.id, 'rejected')}>
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}

                <Button size="sm" variant="outline" className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200" onClick={() => deleteMedia(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
