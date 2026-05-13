export type TicketPriority = 'low' | 'medium' | 'high'

export type DeveloperTicket = {
  text: string
  priority: TicketPriority
}

export type BriefConversionResponse = {
  instructions: string[]
  tickets: DeveloperTicket[]
}

function getBaseUrl(): string {
  const raw = import.meta.env.API_URL
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(
      'API_URL is not set. Add it to frontend/.env (e.g. API_URL=http://localhost:3000).',
    )
  }
  return raw.replace(/\/$/, '')
}

function formatHttpError(status: number, body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const m = (body as { message: unknown }).message
    if (Array.isArray(m)) {
      return m.map(String).join('; ')
    }
    if (typeof m === 'string') {
      return m
    }
  }
  return `Request failed (${status})`
}

export async function convertBrief(
  text: string,
): Promise<BriefConversionResponse> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/briefs/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  const body: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(formatHttpError(res.status, body))
  }

  return body as BriefConversionResponse
}
