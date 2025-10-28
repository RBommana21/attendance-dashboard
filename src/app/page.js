"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Page() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("[v0] Component mounted, starting fetch...")

    async function fetchData() {
      try {
        console.log("[v0] Fetching agents from Firebase...")
        const agentsCollection = collection(db, "agents")
        const agentsSnapshot = await getDocs(agentsCollection)
        const agentsList = agentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        console.log("[v0] Agents fetched successfully:", agentsList)
        setAgents(agentsList)
        setLoading(false)
      } catch (err) {
        console.error("[v0] Error fetching agents:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalAgents = agents.length
  const teamBreakdown = agents.reduce((acc, agent) => {
    const team = agent.Team || "Unknown"
    acc[team] = (acc[team] || 0) + 1
    return acc
  }, {})

  const shiftBreakdown = agents.reduce((acc, agent) => {
    const shift = agent.Shift || "Unknown"
    acc[shift] = (acc[shift] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">Loading...</div>
          <p className="mt-2 text-muted-foreground">Fetching agent data from Firebase</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">Error</div>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of agent metrics</p>
      </header>

      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Total Agents Card */}
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Total Agents</h3>
            <p className="mt-2 text-6xl font-bold text-foreground">{totalAgents}</p>
          </div>

          {/* Team Breakdown */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-card-foreground">Breakdown by Team</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(teamBreakdown).map(([team, count]) => (
                  <div key={team} className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{team}</h3>
                    <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {((count / totalAgents) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shift Breakdown */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-card-foreground">Breakdown by Shift</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(shiftBreakdown).map(([shift, count]) => (
                  <div key={shift} className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{shift}</h3>
                    <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {((count / totalAgents) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
