"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageSquare, User } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface ChatMessage {
  id: string
  user_id: string
  message: string
  sender_type: "client" | "admin"
  read: boolean
  created_at: string
  user?: { name: string }
}

interface ChatConversation {
  user_id: string
  user_name: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function ChatSupport() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<number>(0)
  const [userStatus, setUserStatus] = useState<Record<string, 'online' | 'offline' | 'away'>>({})
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  
  // Chat history implementation
  const [chatHistory, setChatHistory] = useState([]) // conversation history implementation
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Notification system
  useEffect(() => {
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0)
    setNotifications(totalUnread)
    
    // Simulate user status
    const statusMap: Record<string, 'online' | 'offline' | 'away'> = {}
    conversations.forEach(conv => {
      statusMap[conv.user_id] = Math.random() > 0.5 ? 'online' : Math.random() > 0.5 ? 'away' : 'offline'
    })
    setUserStatus(statusMap)
  }, [conversations])

  // Simulate typing indicator
  const handleTyping = (userId: string) => {
    setTypingUsers(prev => new Set([...prev, userId]))
    setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }, 3000)
  }

  const loadConversations = async () => {
    try {
      // Mock data for demonstration
      const mockConversations: ChatConversation[] = [
        {
          user_id: "1",
          user_name: "João Silva",
          last_message: "Gostaria de reagendar meu horário",
          last_message_time: new Date().toISOString(),
          unread_count: 2,
        },
        {
          user_id: "2",
          user_name: "Maria Santos",
          last_message: "Obrigada pelo excelente serviço!",
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 0,
        },
        {
          user_id: "3",
          user_name: "Pedro Costa",
          last_message: "Qual o valor do polimento?",
          last_message_time: new Date(Date.now() - 7200000).toISOString(),
          unread_count: 1,
        },
      ]

      setConversations(mockConversations)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      // Mock messages for demonstration
      const mockMessages: ChatMessage[] = [
        {
          id: "1",
          user_id: userId,
          message: "Olá! Gostaria de agendar um serviço",
          sender_type: "client",
          read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user: { name: "João Silva" },
        },
        {
          id: "2",
          user_id: userId,
          message: "Olá! Claro, posso ajudá-lo. Que tipo de serviço você gostaria?",
          sender_type: "admin",
          read: true,
          created_at: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: "3",
          user_id: userId,
          message: "Gostaria de uma lavagem completa para amanhã",
          sender_type: "client",
          read: true,
          created_at: new Date(Date.now() - 3400000).toISOString(),
          user: { name: "João Silva" },
        },
        {
          id: "4",
          user_id: userId,
          message: "Perfeito! Temos horários disponíveis às 14h e 16h. Qual prefere?",
          sender_type: "admin",
          read: true,
          created_at: new Date(Date.now() - 3300000).toISOString(),
        },
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      user_id: selectedConversation,
      message: newMessage,
      sender_type: "admin",
      read: false,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // In a real app, save to database
    try {
      // await supabase.from("chat_messages").insert([message])
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusColor = (status: 'online' | 'offline' | 'away') => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chat de Suporte</h1>
        <p className="text-gray-600">Converse com seus clientes em tempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Conversas</span>
              {conversations.reduce((sum, conv) => sum + conv.unread_count, 0) > 0 && (
                <Badge variant="destructive">{conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.user_id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                    selectedConversation === conversation.user_id ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation.user_id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {conversation.user_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.user_name}</p>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(conversation.last_message_time).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(userStatus[conversation.user_id])}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{conversations.find((c) => c.user_id === selectedConversation)?.user_name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-96">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_type === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
