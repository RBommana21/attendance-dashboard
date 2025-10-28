export async function GET(request) {
  try {
    // Get the timestamp from query params or use current time
    const { searchParams } = new URL(request.url)
    let timestamp = searchParams.get("as_of")

    if (!timestamp) {
      // Create timestamp in format: YYYY-MM-DD HH:MM:SS
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      const hours = String(now.getHours()).padStart(2, "0")
      const minutes = String(now.getMinutes()).padStart(2, "0")
      const seconds = String(now.getSeconds()).padStart(2, "0")
      timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    // Fetch from the Cloud Function
    const url = `https://fetchconsilidateddata-wlf5xd32uq-uc.a.run.app?as_of=${encodeURIComponent(timestamp)}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Return the data
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching agent details:", error)
    return Response.json({ error: "Failed to fetch agent details" }, { status: 500 })
  }
}
