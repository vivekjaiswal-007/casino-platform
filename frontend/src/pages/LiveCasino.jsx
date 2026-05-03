import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, api } from '../store/useStore'

const CATEGORIES = [
  { id: 'all', label: 'All Games', icon: '🎮' },
  { id: 'slots', label: 'Slots', icon: '🎰' },
  { id: 'table', label: 'Table', icon: '🃏' },
  { id: 'fishing', label: 'Fishing', icon: '🎣' },
  { id: 'arcade', label: 'Arcade', icon: '🕹️' },
]

export default function LiveCasino() {
  const { user } = useStore()
  const navigate = useNavigate()

  const [games, setGames] = useState([])
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ✅ FIXED API CALL
  useEffect(() => {
    setLoading(true)

   useEffect(() => {
  setLoading(true)

  fetch("https://casino-platform-8os6.onrender.com/api/live-casino/games")
    .then(res => res.json())
    .then(data => {
      console.log("🔥 Games:", data)

      setGames(data)   // ✅ direct array
      setLoading(false)
    })
    .catch(err => {
      console.error("❌ Error:", err)
      setError("Failed to load games")
      setLoading(false)
    })

}, [cat])
      .catch((err) => {
        console.error("❌ API Error:", err)
        setError("Failed to load games")
        setLoading(false)
      })
  }, [cat])

  // 🔍 search filter
  const filtered = games.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: "20px", color: "white" }}>

      <h1>🎰 Live Casino</h1>

      {/* CATEGORY */}
      <div style={{ marginBottom: "15px" }}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            style={{
              marginRight: "10px",
              padding: "8px 15px",
              background: cat === c.id ? "#c9a227" : "#222",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search games..."
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          borderRadius: "10px",
          border: "1px solid #333",
          background: "#111",
          color: "white"
        }}
      />

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LOADING */}
      {loading ? (
        <p>Loading games...</p>
      ) : filtered.length === 0 ? (
        <p>No games found</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "15px"
        }}>
          {filtered.map(game => (
            <div
              key={game.id || game.game_uid}
              style={{
                background: "#1a1a1a",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #333"
              }}
            >
              <h3>{game.name}</h3>
              <p>{game.category}</p>

              <button
                onClick={() => {
                  if (!user) return navigate("/login")
                  alert("Game launch next step 🚀")
                }}
                style={{
                  marginTop: "10px",
                  padding: "8px",
                  background: "#c9a227",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                ▶ Play
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}