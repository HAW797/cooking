import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function proxyRequest(request: NextRequest, path: string) {
  const url = new URL(request.url)
  const apiUrl = `${API_BASE_URL}/api/${path}${url.search}`

  console.log(`Proxying ${request.method} request to: ${apiUrl}`)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Forward relevant headers
  const forwardHeaders = ['cookie', 'x-csrf-token', 'authorization']
  forwardHeaders.forEach(headerName => {
    const value = request.headers.get(headerName)
    if (value) {
      headers[headerName] = value
    }
  })

  try {
    const body = request.method !== 'GET' && request.method !== 'HEAD' 
      ? await request.text()
      : undefined

    const backendResponse = await fetch(apiUrl, {
      method: request.method,
      headers,
      body,
      credentials: 'include',
    })

    // Get response body
    const responseBody = await backendResponse.text()

    // Create response headers
    const responseHeaders = new Headers({
      'Content-Type': backendResponse.headers.get('Content-Type') || 'application/json',
    })

    // Forward ALL Set-Cookie headers from backend (there can be multiple)
    // Note: Raw headers API needed for multiple Set-Cookie headers
    const rawSetCookies = backendResponse.headers.raw ? backendResponse.headers.raw()['set-cookie'] : null
    
    if (rawSetCookies) {
      rawSetCookies.forEach((cookie) => {
        responseHeaders.append('Set-Cookie', cookie)
      })
    } else {
      // Fallback for environments without raw() API
      const setCookie = backendResponse.headers.get('set-cookie')
      if (setCookie) {
        responseHeaders.set('Set-Cookie', setCookie)
      }
    }

    // Create response with proper headers
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    })

    console.log(`Response status: ${backendResponse.status}`)
    console.log(`Set-Cookie headers: ${response.headers.get('set-cookie')}`)

    return response
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to connect to backend API' },
      { status: 503 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  return proxyRequest(request, path)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  return proxyRequest(request, path)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  return proxyRequest(request, path)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  return proxyRequest(request, path)
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  return proxyRequest(request, path)
}

