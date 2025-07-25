import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type } = await req.json()
    
    // Validate emoji type
    if (!['sad', 'neutral', 'happy'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid emoji type. Must be: sad, neutral, or happy' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const HUGGING_FACE_ACCESS_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!HUGGING_FACE_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face access token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const hf = new HfInference(HUGGING_FACE_ACCESS_TOKEN)

    // Define prompts for each emoji type
    const prompts = {
      sad: 'A simple, clean sad face emoji with tears, yellow background, minimalist style, transparent background, PNG format, professional quality for web and email use',
      neutral: 'A simple, clean neutral face emoji with straight mouth, yellow background, minimalist style, transparent background, PNG format, professional quality for web and email use', 
      happy: 'A simple, clean happy face emoji with big smile, yellow background, minimalist style, transparent background, PNG format, professional quality for web and email use'
    }

    console.log(`Generating ${type} emoji with prompt:`, prompts[type])

    const image = await hf.textToImage({
      inputs: prompts[type],
      model: 'black-forest-labs/FLUX.1-schnell',
    })

    // Convert the blob to a Uint8Array
    const arrayBuffer = await image.arrayBuffer()
    const imageData = new Uint8Array(arrayBuffer)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Upload to Supabase Storage
    const fileName = `emoji-${type}-${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(fileName, imageData, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload image to storage' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('emojis')
      .getPublicUrl(fileName)

    console.log(`Successfully generated and uploaded ${type} emoji:`, publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true,
        type,
        url: publicUrl,
        fileName,
        downloadUrl: publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})