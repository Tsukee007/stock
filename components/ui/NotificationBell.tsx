'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  useEffect(() => {
    fetchNotifications()
    const channel = supabase
      .channel('notifs-' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'user_id=eq.' + userId
      }, () => fetchNotifications())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAsRead = async (notification: Notification) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notification.id)
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n))
    setOpen(false)
    if (notification.link) window.location.href = notification.link
  }

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    if (type === 'message') return '💬'
    if (type === 'booking') return '📦'
    if (type === 'contract') return '📄'
    if (type === 'payment') return '💳'
    return '🔔'
  }

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return minutes + ' min'
    if (hours < 24) return hours + 'h'
    return days + 'j'
  }

  return (
    <>
      {/* Overlay mobile pour fermer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="relative" ref={ref}>
        {/* Bouton cloche */}
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-gray-100"
          aria-label="Notifications"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Panel notifications */}
        {open && (
          <div className="
            fixed md:absolute
            inset-x-2 md:inset-x-auto
            top-16 md:top-10
            md:right-0 md:w-80
            bg-white rounded-xl shadow-2xl border z-50 overflow-hidden
          ">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                    Tout lire
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 md:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-sm">Aucune notification</p>
                </div>
              )}
              {notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif)}
                  className={'w-full text-left p-4 border-b hover:bg-gray-50 transition ' + (!notif.read ? 'bg-blue-50' : 'bg-white')}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{getIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={'text-sm font-semibold ' + (!notif.read ? 'text-blue-700' : 'text-gray-800')}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                          {getTimeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <a href="/dashboard" className="text-xs text-blue-600 hover:underline">
                  Voir toutes les activités →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}