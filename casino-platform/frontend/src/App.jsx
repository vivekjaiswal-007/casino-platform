import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import KenoGame from './games/KenoGame'
import CoinFlip from './games/CoinFlip'
import NumberGuess from './games/NumberGuess'
import CrashBall from './games/CrashBall'
import WheelOfFortune from './games/WheelOfFortune'
import ScratchCard from './games/ScratchCard'
import RockPaperScissors from './games/RockPaperScissors'
import LimboGame from './games/LimboGame'
import VideoPoker from './games/VideoPoker'
import HiloCard from './games/HiloCard'
import BallDrop from './games/BallDrop'
import HotCold from './games/HotCold'
import Lucky7s from './games/Lucky7s'
import WarGame from './games/WarGame'
import BlackjackSwitch from './games/BlackjackSwitch'
import DiceBattle from './games/DiceBattle'
import ThreeCardPoker from './games/ThreeCardPoker'
import MiniBaccarat from './games/MiniBaccarat'
import PenaltyShootout from './games/PenaltyShootout'
import WhatsAppButton from './components/WhatsAppButton'
import Dashboard from './pages/Dashboard'
import GameLobby from './pages/GameLobby'
import LiveCasino from './pages/LiveCasino'
import AllGames from './pages/AllGames'

// Games — default imports via re-export wrappers
import AviatorGame from './games/AviatorGame'
import CrashRocket from './games/CrashRocket'
import ColorPrediction from './games/ColorPrediction'
import RouletteGame from './games/RouletteGame'
import SlotMachine from './games/SlotMachine'
import LuckyWheel from './games/LuckyWheel'
import MinesGame from './games/MinesGame'
import PlinkoGame from './games/PlinkoGame'
import ChickenRoad from './games/ChickenRoad'
import SicBoGame from './games/SicBoGame'

// Games from BlackjackGame.jsx — via re-export wrappers (all default imports)
import BlackjackGame from './games/BlackjackGame'
import BaccaratGame from './games/BaccaratGame'
import TeenPattiGame from './games/TeenPattiGame'
import AndarBahar from './games/AndarBahar'
import GameWrapper from './components/GameWrapper'
import DragonTiger from './games/DragonTiger'
import PokerGame from './games/PokerGame'
import TowerGame from './games/TowerGame'

// Games from DiceGame.jsx — via re-export wrappers (all default imports)
import DiceGame from './games/DiceGame'
import HiLoGame from './games/HiLoGame'
import SpinWin from './games/SpinWin'

const ProtectedRoute = ({ children }) => {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, fetchBalance } = useStore()

  useEffect(() => {
    if (user) fetchBalance()
  }, [user])

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="lobby" element={<GameLobby />} />
        <Route path="live-casino" element={<LiveCasino />} />
        <Route path="live-casino/return" element={<LiveCasino />} />
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="games/aviator" element={<ProtectedRoute><GameWrapper><AviatorGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/crash-rocket" element={<ProtectedRoute><GameWrapper><CrashRocket /></GameWrapper></ProtectedRoute>} />
        <Route path="games/color-prediction" element={<ProtectedRoute><GameWrapper><ColorPrediction /></GameWrapper></ProtectedRoute>} />
        <Route path="games/roulette" element={<ProtectedRoute><GameWrapper><RouletteGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/blackjack" element={<ProtectedRoute><GameWrapper><BlackjackGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/baccarat" element={<ProtectedRoute><GameWrapper><BaccaratGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/teen-patti" element={<ProtectedRoute><GameWrapper><TeenPattiGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/andar-bahar" element={<ProtectedRoute><GameWrapper><AndarBahar /></GameWrapper></ProtectedRoute>} />
        <Route path="games/poker" element={<ProtectedRoute><GameWrapper><PokerGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/slots" element={<ProtectedRoute><GameWrapper><SlotMachine /></GameWrapper></ProtectedRoute>} />
        <Route path="games/dragon-tiger" element={<ProtectedRoute><GameWrapper><DragonTiger /></GameWrapper></ProtectedRoute>} />
        <Route path="games/sic-bo" element={<ProtectedRoute><GameWrapper><SicBoGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/dice" element={<ProtectedRoute><GameWrapper><DiceGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/lucky-wheel" element={<ProtectedRoute><GameWrapper><LuckyWheel /></GameWrapper></ProtectedRoute>} />
        <Route path="games/mines" element={<ProtectedRoute><GameWrapper><MinesGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/plinko" element={<ProtectedRoute><GameWrapper><PlinkoGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/chicken-road" element={<ProtectedRoute><GameWrapper><ChickenRoad /></GameWrapper></ProtectedRoute>} />
        <Route path="games/tower" element={<ProtectedRoute><GameWrapper><TowerGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/hi-lo" element={<ProtectedRoute><GameWrapper><HiLoGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/spin-win" element={<ProtectedRoute><GameWrapper><SpinWin /></GameWrapper></ProtectedRoute>} />
        <Route path="games/keno" element={<ProtectedRoute><GameWrapper><KenoGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/coin-flip" element={<ProtectedRoute><GameWrapper><CoinFlip /></GameWrapper></ProtectedRoute>} />
        <Route path="games/number-guess" element={<ProtectedRoute><GameWrapper><NumberGuess /></GameWrapper></ProtectedRoute>} />
        <Route path="games/crash-ball" element={<ProtectedRoute><GameWrapper><CrashBall /></GameWrapper></ProtectedRoute>} />
        <Route path="games/wheel-fortune" element={<ProtectedRoute><GameWrapper><WheelOfFortune /></GameWrapper></ProtectedRoute>} />
        <Route path="games/scratch-card" element={<ProtectedRoute><GameWrapper><ScratchCard /></GameWrapper></ProtectedRoute>} />
        <Route path="games/rps" element={<ProtectedRoute><GameWrapper><RockPaperScissors /></GameWrapper></ProtectedRoute>} />
        <Route path="games/limbo" element={<ProtectedRoute><GameWrapper><LimboGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/video-poker" element={<ProtectedRoute><GameWrapper><VideoPoker /></GameWrapper></ProtectedRoute>} />
        <Route path="games/hilo-card" element={<ProtectedRoute><GameWrapper><HiloCard /></GameWrapper></ProtectedRoute>} />
        <Route path="games/ball-drop" element={<ProtectedRoute><GameWrapper><BallDrop /></GameWrapper></ProtectedRoute>} />
        <Route path="games/hot-cold" element={<ProtectedRoute><GameWrapper><HotCold /></GameWrapper></ProtectedRoute>} />
        <Route path="games/lucky-7s" element={<ProtectedRoute><GameWrapper><Lucky7s /></GameWrapper></ProtectedRoute>} />
        <Route path="games/war" element={<ProtectedRoute><GameWrapper><WarGame /></GameWrapper></ProtectedRoute>} />
        <Route path="games/blackjack-switch" element={<ProtectedRoute><GameWrapper><BlackjackSwitch /></GameWrapper></ProtectedRoute>} />
        <Route path="games/dice-battle" element={<ProtectedRoute><GameWrapper><DiceBattle /></GameWrapper></ProtectedRoute>} />
        <Route path="games/three-card-poker" element={<ProtectedRoute><GameWrapper><ThreeCardPoker /></GameWrapper></ProtectedRoute>} />
        <Route path="games/mini-baccarat" element={<ProtectedRoute><GameWrapper><MiniBaccarat /></GameWrapper></ProtectedRoute>} />
        <Route path="games/penalty" element={<ProtectedRoute><GameWrapper><PenaltyShootout /></GameWrapper></ProtectedRoute>} />
      </Route>
    </Routes>
    <WhatsAppButton />
    </>
  )
}
