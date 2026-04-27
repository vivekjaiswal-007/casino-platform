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
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="games/aviator" element={<ProtectedRoute><AviatorGame /></ProtectedRoute>} />
        <Route path="games/crash-rocket" element={<ProtectedRoute><CrashRocket /></ProtectedRoute>} />
        <Route path="games/color-prediction" element={<ProtectedRoute><ColorPrediction /></ProtectedRoute>} />
        <Route path="games/roulette" element={<ProtectedRoute><RouletteGame /></ProtectedRoute>} />
        <Route path="games/blackjack" element={<ProtectedRoute><BlackjackGame /></ProtectedRoute>} />
        <Route path="games/baccarat" element={<ProtectedRoute><BaccaratGame /></ProtectedRoute>} />
        <Route path="games/teen-patti" element={<ProtectedRoute><TeenPattiGame /></ProtectedRoute>} />
        <Route path="games/andar-bahar" element={<ProtectedRoute><AndarBahar /></ProtectedRoute>} />
        <Route path="games/poker" element={<ProtectedRoute><PokerGame /></ProtectedRoute>} />
        <Route path="games/slots" element={<ProtectedRoute><SlotMachine /></ProtectedRoute>} />
        <Route path="games/dragon-tiger" element={<ProtectedRoute><DragonTiger /></ProtectedRoute>} />
        <Route path="games/sic-bo" element={<ProtectedRoute><SicBoGame /></ProtectedRoute>} />
        <Route path="games/dice" element={<ProtectedRoute><DiceGame /></ProtectedRoute>} />
        <Route path="games/lucky-wheel" element={<ProtectedRoute><LuckyWheel /></ProtectedRoute>} />
        <Route path="games/mines" element={<ProtectedRoute><MinesGame /></ProtectedRoute>} />
        <Route path="games/plinko" element={<ProtectedRoute><PlinkoGame /></ProtectedRoute>} />
        <Route path="games/chicken-road" element={<ProtectedRoute><ChickenRoad /></ProtectedRoute>} />
        <Route path="games/tower" element={<ProtectedRoute><TowerGame /></ProtectedRoute>} />
        <Route path="games/hi-lo" element={<ProtectedRoute><HiLoGame /></ProtectedRoute>} />
        <Route path="games/spin-win" element={<ProtectedRoute><SpinWin /></ProtectedRoute>} />
        <Route path="games/keno" element={<ProtectedRoute><KenoGame /></ProtectedRoute>} />
        <Route path="games/coin-flip" element={<ProtectedRoute><CoinFlip /></ProtectedRoute>} />
        <Route path="games/number-guess" element={<ProtectedRoute><NumberGuess /></ProtectedRoute>} />
        <Route path="games/crash-ball" element={<ProtectedRoute><CrashBall /></ProtectedRoute>} />
        <Route path="games/wheel-fortune" element={<ProtectedRoute><WheelOfFortune /></ProtectedRoute>} />
        <Route path="games/scratch-card" element={<ProtectedRoute><ScratchCard /></ProtectedRoute>} />
        <Route path="games/rps" element={<ProtectedRoute><RockPaperScissors /></ProtectedRoute>} />
        <Route path="games/limbo" element={<ProtectedRoute><LimboGame /></ProtectedRoute>} />
        <Route path="games/video-poker" element={<ProtectedRoute><VideoPoker /></ProtectedRoute>} />
        <Route path="games/hilo-card" element={<ProtectedRoute><HiloCard /></ProtectedRoute>} />
        <Route path="games/ball-drop" element={<ProtectedRoute><BallDrop /></ProtectedRoute>} />
        <Route path="games/hot-cold" element={<ProtectedRoute><HotCold /></ProtectedRoute>} />
        <Route path="games/lucky-7s" element={<ProtectedRoute><Lucky7s /></ProtectedRoute>} />
        <Route path="games/war" element={<ProtectedRoute><WarGame /></ProtectedRoute>} />
        <Route path="games/blackjack-switch" element={<ProtectedRoute><BlackjackSwitch /></ProtectedRoute>} />
        <Route path="games/dice-battle" element={<ProtectedRoute><DiceBattle /></ProtectedRoute>} />
        <Route path="games/three-card-poker" element={<ProtectedRoute><ThreeCardPoker /></ProtectedRoute>} />
        <Route path="games/mini-baccarat" element={<ProtectedRoute><MiniBaccarat /></ProtectedRoute>} />
        <Route path="games/penalty" element={<ProtectedRoute><PenaltyShootout /></ProtectedRoute>} />
      </Route>
    </Routes>
    <WhatsAppButton />
    </>
  )
}
