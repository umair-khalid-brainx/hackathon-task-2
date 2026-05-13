import { useCallback, useState } from 'react'
import { convertBrief, type BriefConversionResponse } from './api/convertBrief'
import './App.css'

export default function App() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BriefConversionResponse | null>(null)

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setResult(null)
      const trimmed = text.trim()
      if (!trimmed) {
        setError('Paste your brief or instructions before converting.')
        return
      }
      setLoading(true)
      try {
        const data = await convertBrief(trimmed)
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    },
    [text],
  )

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo-mark" aria-hidden />
          <h1 className="app-title">Jira Tickets Converter</h1>
          <p className="app-tagline">
            Turn unstructured client briefs into developer instructions and
            lifecycle-ordered tickets.
          </p>
        </div>
      </header>

      <main className="app-main">
        <form className="app-form" onSubmit={onSubmit}>
          <label htmlFor="brief" className="app-label">
            Client brief / instructions
          </label>
          <textarea
            id="brief"
            className="app-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full brief text here…"
            rows={14}
            spellCheck
            disabled={loading}
          />
          <div className="app-actions">
            <button type="submit" className="app-submit" disabled={loading}>
              {loading ? 'Converting…' : 'Convert to instructions & tickets'}
            </button>
          </div>
        </form>

        {error ? (
          <div className="app-alert app-alert--error" role="alert">
            {error}
          </div>
        ) : null}

        {result ? (
          <section className="app-results" aria-label="Conversion results">
            <div className="app-results-col app-results-col--instructions">
              <h2 className="app-results-heading">Instructions</h2>
              <p className="app-results-lead">
                Developer-ready points from your brief.
              </p>
              {result.instructions.length === 0 ? (
                <p className="app-empty">No instructions returned.</p>
              ) : (
                <ul className="app-instructions">
                  {result.instructions.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="app-results-col app-results-col--tickets">
              <h2 className="app-results-heading">Tickets</h2>
              <p className="app-results-lead">
                Lifecycle order; color indicates priority.
              </p>
              {result.tickets.length === 0 ? (
                <p className="app-empty">No tickets returned.</p>
              ) : (
                <div className="app-tickets">
                  {result.tickets.map((t, i) => {
                    const p =
                      t.priority === 'high' ||
                      t.priority === 'medium' ||
                      t.priority === 'low'
                        ? t.priority
                        : 'medium'
                    return (
                      <div
                        key={i}
                        className={`app-ticket app-ticket--${p}`}
                      >
                        <span className="app-ticket-badge">{p}</span>
                        <p className="app-ticket-text">{t.text}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
