import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Get Mailchimp credentials from environment variables
    const apiKey = process.env.MAILCHIMP_API_KEY
    const listId = process.env.MAILCHIMP_LIST_ID
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || 'us16'

    if (!apiKey || !listId) {
      console.error('Mailchimp credentials not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Mailchimp API endpoint
    const mailchimpUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`

    // Subscribe user to Mailchimp
    const response = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: name.split(' ')[0] || name,
          LNAME: name.split(' ').slice(1).join(' ') || '',
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle Mailchimp errors
      if (response.status === 400 && data.title === 'Member Exists') {
        return NextResponse.json({ error: 'This email is already subscribed' }, { status: 400 })
      }

      console.error('Mailchimp API error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to subscribe' },
        { status: response.status },
      )
    }

    return NextResponse.json(
      { message: 'Successfully subscribed to mailing list' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
