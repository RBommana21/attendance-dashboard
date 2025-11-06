"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { Clock } from "lucide-react"
import { db } from "@/lib/firebase"

async function getFirstLoginsForDay(firestoreDb, selectedDateString) {
  // 1. Prepare the start and end timestamps for the selected day
  const startOfDay = new Date(`${selectedDateString}T00:00:00`);
  const endOfDay = new Date(`${selectedDateString}T23:59:59.999`);

  const logsRef = collection(firestoreDb, "attendanceLogs");
  const q = query(
    logsRef,
    where("datetime", ">=", startOfDay),
    where("datetime", "<=", endOfDay),
    orderBy("datetime", "asc")
  );

  const querySnapshot = await getDocs(q);

  const agentFirstLogins = {};

  querySnapshot.forEach((doc) => {
    const log = doc.data();
    const ldap = log.ldap.split("@")[0];

    if (!agentFirstLogins[ldap]) {
      agentFirstLogins[ldap] = {
        time: log.datetime.toDate(), 
        log: log, 
      };
    }
  });

  return agentFirstLogins;
}
// --- End Optimized Function ---


export default function LateLoginsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [lateLogins, setLateLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format time
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to determine severity for styling
  const getLateSeverity = (hoursLate) => {
    if (hoursLate < 0.5) return "bg-yellow-500/10 text-yellow-500";
    if (hoursLate < 1) return "bg-orange-500/10 text-orange-500";
    return "bg-red-500/10 text-red-500";
  };

  // The main data fetching logic, wrapped in useCallback
  const fetchLateLoginsData = useCallback(async () => {
    try {
      setLoading(true); // Start loading

      // --- Step 1: Fetch Agents ---
      const agentsCollection = collection(db, "agents");
      const agentsSnapshot = await getDocs(agentsCollection);
      const agentsMap = {}; 
      agentsSnapshot.forEach((doc) => {
        const data = doc.data();
        agentsMap[data.LDAP] = data.AccessRights; 
      });

      // --- Step 2: Use the Optimized Function to get First Logins for the Day ---
      const agentFirstLogins = await getFirstLoginsForDay(db, selectedDate);

      // --- Step 3: Filter Agents who logged in after 10 AM ---
      const lateLoginsList = [];
      Object.entries(agentFirstLogins).forEach(([ldap, data]) => {
        const loginHour = data.time.getHours();
        const loginMinute = data.time.getMinutes();

        // Check if login is after 10:00 AM
        if (loginHour > 10 || (loginHour === 10 && loginMinute > 0)) {
          lateLoginsList.push({
            ldap: ldap,
            name: agentsMap[ldap] || "Unknown Agent",
            loginTime: data.time,
            hoursLate: (loginHour - 10) + (loginMinute / 60), 
          });
        }
      });

      // --- Step 4: Sort by login time (latest first) ---
      lateLoginsList.sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime());

      setLateLogins(lateLoginsList); // Update state with the fetched data
    } catch (error) {
      console.error("Error fetching late logins:", error);
      // Optionally set an error state here to display to the user
      setLateLogins([]); // Clear previous data on error
    } finally {
      setLoading(false); // End loading
    }
  }, [selectedDate]); // This function re-creates if selectedDate changes

  // useEffect to call the data fetching function when selectedDate changes (via fetchLateLoginsData)
  useEffect(() => {
    fetchLateLoginsData();
  }, [fetchLateLoginsData]); // Depend on fetchLateLoginsData, which itself depends on selectedDate

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Late Logins</h1>
            <p className="text-muted-foreground">Agents who logged in after 10:00 AM</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-4 py-2 border rounded-lg bg-background text-foreground"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {loading ? (
                "Loading..."
              ) : (
                <>
                  {lateLogins.length} Late Login{lateLogins.length !== 1 ? "s" : ""} on{" "}
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading late logins...</p>
              </div>
            ) : lateLogins.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium mb-1">No late logins found</p>
                <p className="text-sm text-muted-foreground">All agents logged in on time for {selectedDate}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">LDAP</th>
                      <th className="text-left py-3 px-4 font-semibold">Login Time</th>
                      <th className="text-left py-3 px-4 font-semibold">Minutes Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lateLogins.map((login) => (
                      <tr key={login.ldap} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-medium">{login.name}</td>
                        <td className="py-4 px-4 text-muted-foreground">{login.ldap}</td>
                        <td className="py-4 px-4">{formatTime(login.loginTime)}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getLateSeverity(
                              login.hoursLate,
                            )}`}
                          >
                            {(login.hoursLate * 60).toFixed(0)} min
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}