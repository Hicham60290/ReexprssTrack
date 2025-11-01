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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const packageId = formData.get('packageId') as string
    const trackingNumber = formData.get('trackingNumber') as string
    const description = formData.get('description') as string || ''

    if (!file) {
      throw new Error('No file provided')
    }

    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Limiter la taille à 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    let finalPackageId = packageId

    // Si pas de packageId mais trackingNumber fourni, chercher ou créer le colis
    if (!packageId && trackingNumber) {
      // Chercher le colis existant
      const { data: existingPackage } = await supabaseClient
        .from('packages')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .eq('user_id', user.id)
        .single()

      if (existingPackage) {
        finalPackageId = existingPackage.id
      } else {
        // Créer un nouveau colis
        const { data: newPackage, error: createError } = await supabaseClient
          .from('packages')
          .insert({
            user_id: user.id,
            tracking_number: trackingNumber,
            description: description || 'Colis reçu',
            status: 'received',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single()

        if (createError) throw createError
        finalPackageId = newPackage.id
      }
    }

    if (!finalPackageId) {
      throw new Error('Package ID or tracking number required')
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop()
    const fileName = `package-${finalPackageId}-${Date.now()}.${fileExtension}`
    const filePath = `packages/${user.id}/${fileName}`

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('package-photos')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) throw uploadError

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabaseClient.storage
      .from('package-photos')
      .getPublicUrl(filePath)

    // Mettre à jour le colis avec la nouvelle photo
    const { data: currentPackage } = await supabaseClient
      .from('packages')
      .select('photos')
      .eq('id', finalPackageId)
      .single()

    const currentPhotos = currentPackage?.photos || []
    const newPhotos = [...currentPhotos, {
      url: publicUrl,
      filename: fileName,
      uploaded_at: new Date().toISOString(),
      description: description
    }]

    const { error: updateError } = await supabaseClient
      .from('packages')
      .update({ 
        photos: newPhotos,
        status: 'received',
        updated_at: new Date().toISOString()
      })
      .eq('id', finalPackageId)

    if (updateError) throw updateError

    // Envoyer une notification à l'utilisateur
    try {
      await supabaseClient.functions.invoke('send-notification-email', {
        body: {
          templateType: 'package_photo_uploaded',
          userId: user.id,
          recipientEmail: user.email,
          variables: {
            tracking_number: trackingNumber,
            photo_count: newPhotos.length,
            description: description || 'Photo du colis reçu'
          }
        }
      })
    } catch (notificationError) {
      console.log('Notification email failed:', notificationError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        photo_url: publicUrl,
        package_id: finalPackageId,
        message: 'Photo uploaded successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
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