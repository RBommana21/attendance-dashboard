"use client"

import { useEffect, useState } from "react"

export default function AgentDetailsPage() {
  const [agentData, setAgentData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAgentDetails() {
      try {
        const timestamp = new Date().toISOString()
        const url = `/api/agent-details?as_of=${encodeURIComponent(timestamp)}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch agent details")
        }

        const data = await response.json()
        setAgentData(data)
      } catch (err) {
        console.error("Error fetching agent details:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAgentDetails()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Agent Work Details</h1>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-full">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-card-foreground">Agent Activity Report</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">LDAP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Shift Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Start Time (CST)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">First In Office Log</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Last Log Time (CST)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Minutes Since Last Log</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Last Log Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Last In Office Log</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Total Work Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Work Hours Within Shift</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Work Hours in Office</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground">Workday Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan="13" className="px-6 py-8 text-center text-muted-foreground">
                        Loading agent details...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="13" className="px-6 py-8 text-center text-red-500">
                        Error: {error}
                      </td>
                    </tr>
                  ) : agentData.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="px-6 py-8 text-center text-muted-foreground">
                        No agent data found
                      </td>
                    </tr>
                  ) : (
                    agentData.map((agent, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm text-card-foreground">{agent.agent}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.ldap}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.shiftType}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.startTime}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.firstInOfficeLog}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.lastLogTime}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.minutesSinceLastLog}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.lastLogDescription}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.lastInOfficeLog}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.totalWorkHours}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.totalWorkHoursWithinShift}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{agent.totalWorkHoursInOffice}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              agent.workdayStatus === "Active"
                                ? "bg-green-500/10 text-green-500"
                                : agent.workdayStatus === "Inactive"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {agent.workdayStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
