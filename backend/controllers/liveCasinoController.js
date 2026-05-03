// backend/controllers/liveCasinoController.js

// 🎮 GET GAMES (WORKING)
export const getLiveGames = (req, res) => {
  try {
    console.log("🔥 getLiveGames called")

    res.status(200).json([
      {
        id: "1",
        name: "Live Roulette",
        category: "table",
        provider: "demo"
      },
      {
        id: "2",
        name: "Live Blackjack",
        category: "table",
        provider: "demo"
      },
      {
        id: "3",
        name: "Live Baccarat",
        category: "table",
        provider: "demo"
      }
    ])

  } catch (error) {
    console.error("❌ getLiveGames error:", error)
    res.status(500).json({ error: "Failed to fetch games" })
  }
}


// 🚀 LAUNCH GAME (DUMMY)
export const launchGame = (req, res) => {
  try {
    console.log("🚀 launchGame called")

    res.json({
      success: true,
      url: "https://example.com/live-game-demo"
    })

  } catch (error) {
    console.error("❌ launchGame error:", error)
    res.status(500).json({ error: "Launch failed" })
  }
}


// 🔁 CALLBACK (DUMMY)
export const gameCallback = (req, res) => {
  try {
    console.log("🔁 Callback received:", req.body)

    res.json({
      status: "ok",
      message: "Callback handled"
    })

  } catch (error) {
    console.error("❌ Callback error:", error)
    res.status(500).json({ error: "Callback failed" })
  }
}


// 💰 BALANCE (DUMMY)
export const getLiveBalance = (req, res) => {
  try {
    res.json({
      balance: 1000
    })

  } catch (error) {
    console.error("❌ Balance error:", error)
    res.status(500).json({ error: "Balance fetch failed" })
  }
}