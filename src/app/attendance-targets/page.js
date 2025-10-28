"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Target } from "lucide-react"

export default function AttendanceTargets() {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState("")

  useEffect(() => {
    async function fetchTargets() {
      try {
        const querySnapshot = await getDocs(collection(db, "attendanceTargets"))
        const targetsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        targetsData.sort((a, b) => {
          if (a.Year !== b.Year) return b.Year - a.Year
          return new Date(b.Month + " 1, 2000") - new Date(a.Month + " 1, 2000")
        })
        setTargets(targetsData)
        if (targetsData.length > 0) {
          setSelectedMonth(targetsData[0].MonthYear)
        }
      } catch (error) {
        console.error("Error fetching targets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTargets()
  }, [])

  const selectedTarget = targets.find((t) => t.MonthYear === selectedMonth)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading attendance targets...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Attendance Targets</h1>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {targets.map((target) => (
              <SelectItem key={target.id} value={target.MonthYear}>
                {target.MonthYear}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTarget ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">{selectedTarget.MonthYear}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Days Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Overview</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Days in Month</span>
                  <span className="text-2xl font-bold">{selectedTarget.DaysinMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Days to Work</span>
                  <span className="text-2xl font-bold text-blue-600">{selectedTarget.DaystoWork}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Adjusted Days</span>
                  <span className="text-2xl font-bold text-green-600">{selectedTarget.AdjustedDaystoWork}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hours Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours Overview</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hours in Month</span>
                  <span className="text-2xl font-bold">{selectedTarget.HoursinMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hours to Work</span>
                  <span className="text-2xl font-bold text-blue-600">{selectedTarget.HourstoWork}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Adjusted Hours</span>
                  <span className="text-2xl font-bold text-green-600">{selectedTarget.AdjustedHourstoWork}</span>
                </div>
              </CardContent>
            </Card>

            {/* Target Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target Summary</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Daily Hours Target</div>
                  <div className="text-3xl font-bold text-primary">
                    {(selectedTarget.AdjustedHourstoWork / selectedTarget.AdjustedDaystoWork).toFixed(1)}h
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Work Days Percentage</div>
                  <div className="text-3xl font-bold text-primary">
                    {((selectedTarget.DaystoWork / selectedTarget.DaysinMonth) * 100).toFixed(0)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground">No data available for selected month</div>
      )}
    </div>
  )
}
