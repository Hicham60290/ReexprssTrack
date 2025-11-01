import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const requestBody = await req.json()
    const { action, conversationId, message, category, priority } = requestBody

    console.log('Chat action:', action, 'User:', user.id)

    switch (action) {
      case 'get_conversations':
        const { data: conversations, error: convError } = await supabaseClient
          .from('chat_conversations')
          .select(`
            *,
            chat_messages (
              id,
              message,
              created_at,
              is_support,
              message_type,
              read_at
            )
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (convError) {
          console.error('Error fetching conversations:', convError)
          throw convError
        }

        const conversationsWithLastMessage = conversations?.map(conv => {
          const messages = conv.chat_messages || []
          const sortedMessages = messages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          const lastMessage = sortedMessages[sortedMessages.length - 1] || null
          const unreadCount = messages.filter(msg => 
            msg.is_support && !msg.read_at
          ).length

          return {
            ...conv,
            last_message: lastMessage,
            unread_count: unreadCount
          }
        }) || []

        return new Response(
          JSON.stringify({ success: true, conversations: conversationsWithLastMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_conversation':
        if (!message || message.trim().length === 0) {
          throw new Error('Message is required')
        }

        const { data: newConversation, error: createError } = await supabaseClient
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            category: category || 'general',
            priority: priority || 'normal',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating conversation:', createError)
          throw createError
        }

        // Ajouter le premier message
        const { data: firstMessage, error: messageError } = await supabaseClient
          .from('chat_messages')
          .insert({
            conversation_id: newConversation.id,
            user_id: user.id,
            message: message,
            message_type: 'text',
            is_support: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (messageError) {
          console.error('Error creating first message:', messageError)
          throw messageError
        }

        // NOTIFICATIONS EMAIL DÉSACTIVÉES TEMPORAIREMENT
        // Les notifications par email sont désactivées à ce stade
        // pour éviter les envois automatiques lors des tests

        // Log de la conversation créée (pour le suivi admin)
        console.log('💬 Nouvelle conversation créée:', {
          id: newConversation.id,
          user_id: user.id,
          user_email: user.email,
          category: category || 'general',
          priority: priority || 'normal',
          message_preview: message.substring(0, 100) + '...',
          created_at: new Date().toISOString()
        })

        return new Response(
          JSON.stringify({ success: true, conversation: newConversation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'send_message':
        if (!conversationId || !message || message.trim().length === 0) {
          throw new Error('Conversation ID and message are required')
        }

        // Vérifier que la conversation appartient à l'utilisateur
        const { data: conversation, error: convCheckError } = await supabaseClient
          .from('chat_conversations')
          .select('id, user_id')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single()

        if (convCheckError || !conversation) {
          console.error('Conversation not found:', convCheckError)
          throw new Error('Conversation not found')
        }

        // Ajouter le message
        const { data: newMessage, error: sendError } = await supabaseClient
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            message: message,
            message_type: 'text',
            is_support: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (sendError) {
          console.error('Error sending message:', sendError)
          throw sendError
        }

        // Mettre à jour la conversation
        const { error: updateError } = await supabaseClient
          .from('chat_conversations')
          .update({
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active'
          })
          .eq('id', conversationId)

        if (updateError) {
          console.error('Error updating conversation:', updateError)
        }

        // Log du nouveau message (pour le suivi admin)
        console.log('💬 Nouveau message dans conversation:', {
          conversation_id: conversationId,
          user_id: user.id,
          user_email: user.email,
          message_preview: message.substring(0, 50) + '...',
          created_at: new Date().toISOString()
        })

        return new Response(
          JSON.stringify({ success: true, message: newMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_messages':
        if (!conversationId) {
          throw new Error('Conversation ID is required')
        }

        // Vérifier que la conversation appartient à l'utilisateur
        const { data: userConversation, error: userConvError } = await supabaseClient
          .from('chat_conversations')
          .select('id')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single()

        if (userConvError || !userConversation) {
          console.error('User conversation not found:', userConvError)
          throw new Error('Conversation not found')
        }

        const { data: messages, error: messagesError } = await supabaseClient
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messagesError) {
          console.error('Error fetching messages:', messagesError)
          throw messagesError
        }

        // Marquer les messages du support comme lus
        const { error: markReadError } = await supabaseClient
          .from('chat_messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .eq('is_support', true)
          .is('read_at', null)

        if (markReadError) {
          console.error('Error marking messages as read:', markReadError)
        }

        return new Response(
          JSON.stringify({ success: true, messages: messages || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'close_conversation':
        if (!conversationId) {
          throw new Error('Conversation ID is required')
        }

        const { error: closeError } = await supabaseClient
          .from('chat_conversations')
          .update({
            status: 'closed',
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId)
          .eq('user_id', user.id)

        if (closeError) {
          console.error('Error closing conversation:', closeError)
          throw closeError
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Conversation closed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action: ' + action)
    }

  } catch (error) {
    console.error('Chat manager error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})