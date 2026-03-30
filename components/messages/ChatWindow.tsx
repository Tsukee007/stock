'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles?: {
    full_name: string | null
  }
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
        .select('*, profiles(full_name)')
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
      }, async payload => {
        const { data } = await supabase
          .from('messages')
          .select('*, profiles(full_name)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data])
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

  // Grouper les messages par expéditeur consécutif
  const groupedMessages = messages.reduce((groups: Message[][], msg, i) => {
    if (i === 0 || messages[i-1].sender_id !== msg.sender_id) {
      groups.push([msg])
    } else {
      groups[groups.length - 1].push(msg)
    }
    return groups
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group, gi) => {
          const isMe = group[0].sender_id === currentUserId
          const name = (group[0].profiles as any)?.full_name ?? 'Utilisateur'

          return (
            <div key={gi} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {/* Nom de l'expéditeur */}
              <p className="text-xs text-gray-600 mb-1 px-2">
                {isMe ? 'Vous' : name}
              </p>
              {/* Bulles de messages */}
              <div className={`space-y-1 max-w-xs ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {group.map(msg => (
                  <div key={msg.id}
className={`px-4 py-2 rounded-2xl text-sm ${
  isMe
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-gray-200 text-gray-900 rounded-bl-none'
}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              {/* Heure du dernier message du groupe */}
              <p className="text-xs text-gray-600 mt-1 px-2">
                {new Date(group[group.length-1].created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )
        })}
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