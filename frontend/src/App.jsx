
import { useState, useEffect, useCallback } from 'react'

const API_URL = 'https://multi-agent-platform-mep7.onrender.com'

function App() {
  const [orderId, setOrderId] = useState('ORD123')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')

  // Fetch audit logs from FastAPI
  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    setAuditError('')

    try {
      const response = await fetch(`${API_URL}/audit-logs`)

      if (!response.ok) {
        throw new Error('Could not load audit logs.')
      }

      const data = await response.json()
      setAuditLogs(data.audit_logs || [])
    } catch (error) {
      setAuditError(
        error.message || 'Unable to connect to audit API.'
      )
    } finally {
      setAuditLoading(false)
    }
  }, [])

  // Load audit logs when dashboard opens
  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  // Run refund workflow
  const runRefundWorkflow = async () => {
    if (!orderId.trim()) {
      setResult({
        success: false,
        message: 'Please enter an order ID.',
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed')
      }

      setResult(data)

      // Refresh logs after workflow execution
      await fetchAuditLogs()
    } catch (error) {
      setResult({
        success: false,
        message:
          error.message ||
          'Unable to connect to the backend API.',
      })
    } finally {
      setLoading(false)
    }
  }

  const agents = [
    'Order Agent',
    'Customer Agent',
    'Policy Agent',
    'Refund Agent',
    'Notification Agent',
  ]

  const descriptions = [
    'Retrieves order details',
    'Retrieves customer details',
    'Checks refund policy',
    'Processes mock refund',
    'Generates notification',
  ]

  const agentIcons = ['📦', '👤', '📋', '💰', '🔔']

  const statusStyle = (status) => {
    if (status === 'Completed') {
      return 'bg-green-500/20 text-green-400'
    }

    if (status === 'Rejected') {
      return 'bg-yellow-500/20 text-yellow-400'
    }

    if (status === 'Failed') {
      return 'bg-red-500/20 text-red-400'
    }

    return 'bg-slate-700 text-slate-300'
  }

  const auditStatusStyle = (status) => {
    if (status === 'Success') {
      return 'bg-green-500/20 text-green-400'
    }

    if (status === 'Rejected') {
      return 'bg-yellow-500/20 text-yellow-400'
    }

    return 'bg-red-500/20 text-red-400'
  }

  // Determine agent status, including rejected/skipped steps
  const getAgentStatus = (agent) => {
    if (result.agent_statuses?.[agent]) {
      return result.agent_statuses[agent]
    }

    const steps = result.steps || {}

    if (agent === 'Order Agent') {
      return steps.order ? 'Completed' : 'Failed'
    }

    if (agent === 'Customer Agent') {
      if (steps.customer) return 'Completed'
      return steps.order ? 'Failed' : 'Skipped'
    }

    if (agent === 'Policy Agent') {
      if (!steps.customer) return 'Skipped'
      return steps.eligibility?.eligible
        ? 'Completed'
        : steps.eligibility
          ? 'Rejected'
          : 'Skipped'
    }

    if (agent === 'Refund Agent') {
      if (!steps.eligibility?.eligible) return 'Skipped'
      return steps.refund?.success ? 'Completed' : 'Failed'
    }

    if (agent === 'Notification Agent') {
      if (!steps.refund?.success) return 'Skipped'
      return steps.notification?.success ? 'Completed' : 'Failed'
    }

    return 'Not Run'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold">
            Multi-Agent Business Process Platform
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Intelligent business workflow automation
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-green-400">
              Frontend Connected
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Refund Management Dashboard
          </h2>

          <p className="mt-2 text-slate-400">
            Submit an order and let the AI agents execute
            the refund workflow.
          </p>
        </div>

        {/* Agent Overview */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {agents.map((agent, index) => (
            <div
              key={agent}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500"
            >
              <div className="mb-3 text-3xl">
                {agentIcons[index]}
              </div>

              <h3 className="font-semibold">{agent}</h3>

              <p className="mt-2 text-sm text-slate-400">
                {descriptions[index]}
              </p>
            </div>
          ))}
        </div>

        {/* Refund Form */}
        <div className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h3 className="text-xl font-semibold">
            Start Refund Workflow
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Enter an order ID from the mock database.
          </p>

          <label className="mt-6 block text-sm font-medium text-slate-300">
            Order ID
          </label>

          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Example: ORD123"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={runRefundWorkflow}
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Running Agents...' : 'Run Refund Workflow'}
          </button>

          <p className="mt-3 text-xs text-slate-500">
            Demo mode: Refunds are simulated using mock data.
          </p>
        </div>

        {/* Workflow Results */}
        {result && (
          <div className="mt-10 max-w-4xl space-y-8">
            {/* Agent Execution Status */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h3 className="mb-5 text-xl font-semibold">
                Agent Execution Status
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {agents.map((agent) => {
                  const status = getAgentStatus(agent)

                  return (
                    <div
                      key={agent}
                      className="rounded-lg border border-slate-700 bg-slate-950 p-5"
                    >
                      <p className="font-medium">{agent}</p>

                      <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusStyle(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Order Summary */}
            {result.steps?.order && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h3 className="mb-5 text-xl font-semibold">
                  Order Summary
                </h3>

                <div className="space-y-4 text-sm">
                  {[
                    ['Order ID', result.steps.order.order_id],
                    ['Product', result.steps.order.product],
                    ['Customer', result.steps.customer?.name || 'N/A'],
                    ['Customer Email', result.steps.customer?.email || 'N/A'],
                    ['Order Condition', result.steps.order.condition],
                    ['Order Status', result.steps.order.status],
                    ['Order Amount', `₹${result.steps.order.price}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 border-b border-slate-800 pb-3"
                    >
                      <span className="text-slate-400">{label}</span>
                      <span className="text-right font-medium">
                        {value ?? 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-700 pt-5">
                  <h4 className="mb-3 font-semibold">
                    Refund Eligibility
                  </h4>

                  {result.steps.eligibility ? (
                    <>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                          result.steps.eligibility.eligible
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {result.steps.eligibility.eligible
                          ? 'Eligible'
                          : 'Not Eligible'}
                      </span>

                      <p className="mt-3 text-sm text-slate-300">
                        {result.steps.eligibility.reason ||
                          'No eligibility reason provided.'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Eligibility was not determined.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Workflow Result */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h3 className="mb-5 text-xl font-semibold">
                Workflow Result
              </h3>

              <div
                className={`rounded-lg border p-5 ${
                  result.success
                    ? 'border-green-800 bg-green-950 text-green-300'
                    : 'border-red-800 bg-red-950 text-red-300'
                }`}
              >
                <p className="font-semibold">
                  {result.success
                    ? '✓ Refund Workflow Completed'
                    : '✕ Workflow Failed or Rejected'}
                </p>

                <p className="mt-2 text-sm">{result.message}</p>
              </div>

              {result.refund && (
                <div className="mt-6 space-y-4 text-sm">
                  {[
                    ['Refund ID', result.refund.refund_id],
                    ['Refund Amount', `₹${result.refund.amount}`],
                    ['Refund Status', result.refund.status],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 border-b border-slate-800 pb-3"
                    >
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.steps?.notification && (
                <div className="mt-6 rounded-lg border border-slate-700 bg-slate-950 p-5">
                  <h4 className="mb-3 font-semibold">
                    Notification Details
                  </h4>

                  <p className="text-sm text-slate-400">
                    Channel: {result.steps.notification.channel}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Recipient: {result.steps.notification.recipient}
                  </p>

                  <p className="mt-3 text-sm text-slate-300">
                    {result.steps.notification.message}
                  </p>

                  <p className="mt-3 text-xs text-yellow-400">
                    Mock notification only — no real email was sent.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Audit Logs */}
        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">
                Audit Logs
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                History of agent actions and workflow events.
              </p>
            </div>

            <button
              onClick={fetchAuditLogs}
              disabled={auditLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
            >
              {auditLoading ? 'Refreshing...' : '↻ Refresh Logs'}
            </button>
          </div>

          {auditError && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950 p-4 text-sm text-red-300">
              {auditError}
              <p className="mt-1 text-xs">
                Make sure the backend is running and GET /audit-logs exists.
              </p>
            </div>
          )}

          {!auditError && auditLogs.length === 0 && !auditLoading && (
            <div className="rounded-lg border border-slate-700 bg-slate-950 p-6 text-center text-slate-400">
              No audit logs yet. Run a refund workflow to generate logs.
            </div>
          )}

          {auditLogs.length > 0 && (
            <>
              <p className="mb-4 text-sm text-slate-400">
                {auditLogs.length} audit event(s) recorded
              </p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-slate-700 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {auditLogs.map((log, index) => (
                      <tr
                        key={`${log.timestamp}-${log.action}-${index}`}
                        className="border-b border-slate-800 transition hover:bg-slate-800/50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleString()
                            : 'N/A'}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-medium">
                          {log.order_id || 'N/A'}
                        </td>

                        <td className="px-4 py-4">
                          {log.action || 'N/A'}
                        </td>

                        <td className="min-w-[220px] px-4 py-4 text-slate-400">
                          {log.details || 'N/A'}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${auditStatusStyle(log.status)}`}
                          >
                            {log.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App