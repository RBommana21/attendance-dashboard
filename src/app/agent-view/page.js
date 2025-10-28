"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AgentView() {
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [agentLogs, setAgentLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)

  // Fetch all agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentsCollection = collection(db, "agents")
        const agentsSnapshot = await getDocs(agentsCollection)
        const agentsList = agentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAgents(agentsList)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching agents:", error)
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  // Fetch logs when agent is selected
  useEffect(() => {
    if (!selectedAgent) return

    const fetchAgentLogs = async () => {
      setLogsLoading(true)
      try {
        const logsCollection = collection(db, "attendanceLogs")
        const logsQuery = query(
          logsCollection,
          where("ldap", "==", selectedAgent.LDAP + "@google.com"),
          orderBy("datetime", "desc"),
          limit(5),
        )
        const logsSnapshot = await getDocs(logsQuery)
        console.log(logsSnapshot)
        const logsList = logsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAgentLogs(logsList)
        setLogsLoading(false)
      } catch (error) {
        console.error("Error fetching agent logs:", error)
        setLogsLoading(false)
      }
    }

    fetchAgentLogs()
  }, [selectedAgent])

  const handleAgentSelect = (agentId) => {
    const agent = agents.find((a) => a.id === agentId)
    setSelectedAgent(agent)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading agents...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Agent View</h1>
        <Select onValueChange={handleAgentSelect}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select an agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                 {agent.LDAP}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedAgent ? (
        <div className="text-center text-muted-foreground mt-20">
          <p className="text-lg">Please select an agent from the dropdown to view details</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Agent Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{selectedAgent.AccessRights}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LDAP</p>
                  <p className="text-lg font-semibold">{selectedAgent.LDAP}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team</p>
                  <p className="text-lg font-semibold">{selectedAgent.Team}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shift</p>
                  <p className="text-lg font-semibold">{selectedAgent.Shift}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last 5 Logs Card */}
          <Card>
            <CardHeader>
              <CardTitle>Last 5 Attendance Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8">Loading logs...</div>
              ) : agentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No attendance logs found for this agent</div>
              ) : (
                <div className="space-y-4">
                  {agentLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{log.datetime_str}</p>
                        <p className="text-sm text-muted-foreground">URL Type: {log.urlType}</p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.inOffice && !log.inOffice.includes("not")
                              ? "bg-green-500/20 text-green-700"
                              : "bg-gray-500/20 text-gray-700"
                          }`}
                        >
                          {log.inOffice && !log.inOffice.includes("not") ? "In Office" : "Remote"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.isActive ? "bg-blue-500/20 text-blue-700" : "bg-red-500/20 text-red-700"
                          }`}
                        >
                          {log.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
