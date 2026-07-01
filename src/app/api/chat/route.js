import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return Response.json({ error: 'Session ID required' }, { status: 400 })
    }

    const { data: messages } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    await supabaseAdmin
      .from('chat_messages')
      .update({ read: true })
      .eq('session_id', session_id)
      .eq('is_admin', false)

    const { data: sessionData } = await supabaseAdmin
      .from('chat_sessions')
      .select('status, user_typing, admin_typing, user_typing_at, admin_typing_at')
      .eq('session_id', session_id)
      .maybeSingle()

    const now = new Date()
    const userTyping = sessionData?.user_typing &&
      sessionData?.user_typing_at &&
      (now - new Date(sessionData.user_typing_at)) < 5000

    const adminTyping = sessionData?.admin_typing &&
      sessionData?.admin_typing_at &&
      (now - new Date(sessionData.admin_typing_at)) < 5000

    return Response.json({
      messages: messages || [],
      closed: sessionData?.status === 'closed',
      user_typing: userTyping || false,
      admin_typing: adminTyping || false
    })

  } catch (error) {
    console.error('Chat get error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { session_id, message, sender, user_email, user_name, is_admin } = await req.json()

    if (!session_id || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!is_admin) {
      // Check if session exists
      const { data: existingSession } = await supabaseAdmin
        .from('chat_sessions')
        .select('session_id, status')
        .eq('session_id', session_id)
        .maybeSingle()

      if (!existingSession) {
        // New session — insert fresh
        await supabaseAdmin
          .from('chat_sessions')
          .insert({
            session_id,
            status: 'open',
            user_name: user_name || sender || 'Visitor',
            user_email: user_email || null,
            updated_at: new Date().toISOString()
          })
      } else {
        // Existing session — only update timestamp, never touch status
        await supabaseAdmin
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('session_id', session_id)
      }
    } else {
      // Admin reply — only update timestamp
      await supabaseAdmin
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('session_id', session_id)
    }

    const { data: newMessage } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        session_id,
        message,
        sender: sender || 'User',
        is_admin: is_admin || false,
        user_email: user_email || null,
        user_name: user_name || null,
        read: false
      })
      .select()
      .single()

    if (!is_admin && process.env.PUSHOVER_APP_TOKEN) {
      try {
        const displayMessage = message.startsWith('[IMAGE]')
          ? `${user_name || 'Visitor'} sent an image`
          : `${user_name || 'Visitor'} (${user_email || 'No email'}):\n${message}`

        await fetch('https://api.pushover.net/1/messages.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: process.env.PUSHOVER_APP_TOKEN,
            user: process.env.PUSHOVER_USER_KEY,
            title: `💬 SpaceX Stocks — ${user_name || 'Visitor'}`,
            message: displayMessage,
            priority: 1,
            sound: 'cashregister'
          })
        })
      } catch (pushoverError) {
        console.error('Pushover error:', pushoverError)
      }
    }

    return Response.json({ success: true, message: newMessage })

  } catch (error) {
    console.error('Chat post error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}