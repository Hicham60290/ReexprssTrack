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

    const { conversationId, message, supportToken } = await req.json()

    // Token simple pour authentifier le support (vous pouvez le changer)
    if (supportToken !== 'support_reexpresse_2024') {
      throw new Error('Token support invalide')
    }

    if (!conversationId || !message || message.trim().length === 0) {
      throw new Error('ID conversation et message requis')
    }

    // Vérifier que la conversation existe
    const { data: conversation, error: convError } = await supabaseClient
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      throw new Error('Conversation non trouvée')
    }

    // Ajouter la réponse du support
    const { data: supportMessage, error: messageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        user_id: conversation.user_id,
        message: message.trim(),
        message_type: 'text',
        is_support: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (messageError) {
      throw new Error('Erreur lors de l\'ajout du message')
    }

    // Mettre à jour le statut de la conversation
    await supabaseClient
      .from('chat_conversations')
      .update({
        status: 'replied',
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    // Optionnel : Notifier le client par email de la réponse
    try {
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('id', conversation.user_id)
        .single()

      const userEmail = userProfile?.email
      if (userEmail) {
        await supabaseClient.functions.invoke('send-notification-email', {
          body: {
            templateType: 'chat_support_reply',
            userId: conversation.user_id,
            recipientEmail: userEmail,
            variables: {
              conversation_title: conversation.title,
              support_message: message,
              conversation_id: conversationId,
              dashboard_url: `${Deno.env.get('SITE_URL') || 'https://votre-site.com'}/dashboard`
            }
          }
        })
      }
    } catch (notificationError) {
      console.log('Notification client échouée (non-bloquant):', notificationError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Réponse envoyée avec succès',
        messageId: supportMessage.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur réponse support:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})