export const getLiveGames = async (req, res) => {
  try {
    console.log("🔥 getLiveGames called")

    return res.json([
      {
        id: "1",
        name: "Live Roulette",
        category: "table"
      },
      {
        id: "2",
        name: "Live Blackjack",
        category: "table"
      }
    ])

  } catch (error) {
    console.error("❌ getLiveGames error:", error)
    return res.status(500).json({ error: "Failed to fetch games" })
  }
}