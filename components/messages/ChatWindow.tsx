'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
}

type Props = {
  bookingId: string
  currentUserId: string
}

export default function ChatWindow({ bookingId, currentUserId }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })
      setMessages(data ?? [])
    }
    loadMessages()

    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    setLoading(true)

    const { data: msg } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: currentUserId,
        content: newMessage.trim()
      })
      .select()
      .single()

    if (msg) {
      await fetch('/api/messages/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          content: newMessage.trim(),
          senderId: currentUserId
        })
      })
    }

    setNewMessage('')
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
              msg.sender_id === currentUserId
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {msg.content}
              <p className={`text-xs mt-1 ${
                msg.sender_id === currentUserId ? 'text-blue-200' : 'text-gray-400'
              }`}>
                {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex gap-2">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Écrire un message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim()}
          className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
