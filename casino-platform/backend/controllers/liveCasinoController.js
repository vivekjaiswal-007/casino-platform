import crypto from 'crypto'
import fetch from 'node-fetch'
import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import Bet from '../models/Bet.js'

const TOKEN  = process.env.SOFTAPI_TOKEN  || '4ca69f5fad0148b3bf8d0c456a264d41'
const SECRET = process.env.SOFTAPI_SECRET || '7cb0d561997f7a0821fa3fcabc673de2'
const SERVER = process.env.SOFTAPI_SERVER || 'https://igamingapis.live/api/v1'

function encryptPayload(data, key) {
  if (key.length !== 32) throw new Error('Secret key must be exactly 32 characters')
  const json      = JSON.stringify(data)
  const cipher    = crypto.createCipheriv('aes-256-ecb', Buffer.from(key), null)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  return encrypted.toString('base64')
}

export const LIVE_GAMES = [
  { game_uid: '11521', name: '1 Day Dragon Tiger',  category: 'table',   hot: true,  new: false , img: 'https://igamingapis.com/img/11521.png' },
  { game_uid: '11509', name: '10-10 Cricket',        category: 'table',   hot: true,  new: false , img: 'https://igamingapis.com/img/11509.png' },
  { game_uid: '11523', name: '20-20 Teen Patti',     category: 'table',   hot: true,  new: false , img: 'https://igamingapis.com/img/11523.png' },
  { game_uid: '11527', name: '29 Baccarat',          category: 'table',   hot: false, new: false , img: 'https://igamingapis.com/img/11527.png' },
  { game_uid: '11416', name: '3 Cards Judgement',    category: 'table',   hot: false, new: false , img: 'https://igamingapis.com/img/11416.png' },
  { game_uid: '11419', name: '32 Cards',             category: 'table',   hot: false, new: false , img: 'https://igamingapis.com/img/11419.png' },
  { game_uid: '11522', name: '5 Five Cricket',       category: 'table',   hot: true,  new: false , img: 'https://igamingapis.com/img/11522.png' },
  { game_uid: '11516', name: '6 Player Poker',       category: 'table',   hot: false, new: false , img: 'https://igamingapis.com/img/11516.png' },
  { game_uid: '11499', name: 'AK47 Teen Patti',      category: 'table',   hot: true,  new: false , img: 'https://igamingapis.com/img/11499.png' },
  { game_uid: '11460', name: 'AK47 VR',              category: 'table',   hot: true,  new: true  , img: 'https://igamingapis.com/img/11460.png' },
  { game_uid: '11417', name: 'Amar Akbar Anthony',   category: 'table',   hot: false, new: false , img: 'https://igamingapis.com/img/11417.png' },
  { game_uid: '11471', name: '5D Lottery 1',         category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11471.png' },
  { game_uid: '11468', name: '5D Lottery 10',        category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11468.png' },
  { game_uid: '11470', name: '5D Lottery 3',         category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11470.png' },
  { game_uid: '11469', name: '5D Lottery 5',         category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11469.png' },

  // ── Mac88 Additional Games ──────────────────────────────────────────────
  { game_uid: '11501', name: '20 20 Teenpatti 2', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11501.png' },
  { game_uid: '11421', name: 'Andar Bahar', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11421.png' },
  { game_uid: '11506', name: 'Andar Bahar 50', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11506.png' },
  { game_uid: '11476', name: 'Aviator X', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11476.png' },
  { game_uid: '11463', name: 'AviatorX2', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11463.png' },
  { game_uid: '11536', name: 'Bacarrat', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11536.png' },
  { game_uid: '11426', name: 'Baccarat', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11426.png' },
  { game_uid: '11449', name: 'Ball by Ball VR', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11449.png' },
  { game_uid: '11531', name: 'Bollywood Casino', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11531.png' },
  { game_uid: '11525', name: 'Bollywood Casino B', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11525.png' },
  { game_uid: '11413', name: 'Casino War', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11413.png' },
  { game_uid: '11504', name: 'Center card', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11504.png' },
  { game_uid: '11461', name: 'Center Card VR', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11461.png' },
  { game_uid: '11432', name: 'Chicken Road Cross', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11432.png' },
  { game_uid: '11398', name: 'Chicken Road Cross 2', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11398.png' },
  { game_uid: '11443', name: 'Coin Flip', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11443.png' },
  { game_uid: '11430', name: 'Color Game', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11430.png' },
  { game_uid: '11383', name: 'CRASH MAN', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11383.png' },
  { game_uid: '11459', name: 'Crash X', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11459.png' },
  { game_uid: '11406', name: 'Cricket Battle', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11406.png' },
  { game_uid: '11512', name: 'Cricket Match 20-20', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11512.png' },
  { game_uid: '11380', name: 'Deal Or No Deal', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11380.png' },
  { game_uid: '11455', name: 'Diamonds', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11455.png' },
  { game_uid: '11457', name: 'Dice', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11457.png' },
  { game_uid: '11427', name: 'Dragon Tiger', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11427.png' },
  { game_uid: '11500', name: 'Dragon Tiger 2', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11500.png' },
  { game_uid: '11418', name: 'Dragon Tiger Lion', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11418.png' },
  { game_uid: '11393', name: 'Dragon Tower', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11393.png' },
  { game_uid: '11502', name: 'Dream Wheel', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11502.png' },
  { game_uid: '11533', name: 'DTL', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11533.png' },
  { game_uid: '11520', name: 'Dus Ka Dum', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11520.png' },
  { game_uid: '11503', name: 'Football Studio', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11503.png' },
  { game_uid: '11528', name: 'FootBall Studio Dice', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11528.png' },
  { game_uid: '11442', name: 'Fortune Wheel', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11442.png' },
  { game_uid: '11447', name: 'Hi Lo', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11447.png' },
  { game_uid: '11462', name: 'Hi Lo VR', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11462.png' },
  { game_uid: '11510', name: 'High Low', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11510.png' },
  { game_uid: '11515', name: 'Instant 2 Cards Teenpatti', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11515.png' },
  { game_uid: '11530', name: 'Instant Super Over', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11530.png' },
  { game_uid: '11507', name: 'Instant Teen Patti', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11507.png' },
  { game_uid: '11529', name: 'Instant Teenpatti', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11529.png' },
  { game_uid: '11390', name: 'Jalwa Color Game', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11390.png' },
  { game_uid: '11387', name: 'Jalwa Color Game 10', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11387.png' },
  { game_uid: '11389', name: 'Jalwa Color Game 3', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11389.png' },
  { game_uid: '11388', name: 'Jalwa Color Game 5', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11388.png' },
  { game_uid: '11445', name: 'Jet XT', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11445.png' },
  { game_uid: '11431', name: 'Jhandi Munda', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11431.png' },
  { game_uid: '11366', name: 'Joker Teenpatti One Day', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11366.png' },
  { game_uid: '11467', name: 'K3 Lottery 1', category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11467.png' },
  { game_uid: '11464', name: 'K3 Lottery 10', category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11464.png' },
  { game_uid: '11466', name: 'K3 Lottery 3', category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11466.png' },
  { game_uid: '11465', name: 'K3 Lottery 5', category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11465.png' },
  { game_uid: '11446', name: 'Kitex', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11446.png' },
  { game_uid: '11477', name: 'Lankesh', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11477.png' },
  { game_uid: '11367', name: 'Lightning Dragon Tiger', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11367.png' },
  { game_uid: '11458', name: 'Limbo', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11458.png' },
  { game_uid: '11411', name: 'Lottery', category: 'lottery', hot: false, new: false , img: 'https://igamingapis.com/img/11411.png' },
  { game_uid: '11451', name: 'Lucky 15', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11451.png' },
  { game_uid: '11453', name: 'Lucky 5', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11453.png' },
  { game_uid: '11422', name: 'Lucky 7', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11422.png' },
  { game_uid: '11378', name: 'Lucky Tiger Mines', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11378.png' },
  { game_uid: '11407', name: 'Lucky Tiger Spin', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11407.png' },
  { game_uid: '11535', name: 'Lucky7', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11535.png' },
  { game_uid: '11404', name: 'Marble Run', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11404.png' },
  { game_uid: '11456', name: 'Mines', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11456.png' },
  { game_uid: '11363', name: 'Mini Aviator', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11363.png' },
  { game_uid: '11401', name: 'Mini Coin Flip', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11401.png' },
  { game_uid: '11400', name: 'Mini Crash X', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11400.png' },
  { game_uid: '11364', name: 'Mini Dice', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11364.png' },
  { game_uid: '11402', name: 'Mini Fortune Wheel', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11402.png' },
  { game_uid: '11361', name: 'Mini JetX', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11361.png' },
  { game_uid: '11405', name: 'Mini Limbo', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11405.png' },
  { game_uid: '11403', name: 'Mini Rock Paper Scissors', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11403.png' },
  { game_uid: '11399', name: 'Mini Xroulette', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11399.png' },
  { game_uid: '11508', name: 'Muflis Teenpatti', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11508.png' },
  { game_uid: '11532', name: 'Muflis Teenpatti One Day', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11532.png' },
  { game_uid: '11391', name: 'Naughty Button', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11391.png' },
  { game_uid: '11513', name: 'Note Number', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11513.png' },
  { game_uid: '11519', name: 'One Card 20 20', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11519.png' },
  { game_uid: '11518', name: 'One Card Meter', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11518.png' },
  { game_uid: '11517', name: 'One Card One Day', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11517.png' },
  { game_uid: '11511', name: 'Open Teen patti', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11511.png' },
  { game_uid: '11392', name: 'Packs', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11392.png' },
  { game_uid: '11429', name: 'Pick3 1min', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11429.png' },
  { game_uid: '11428', name: 'Pick3 3min', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11428.png' },
  { game_uid: '11382', name: 'Plane Crash', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11382.png' },
  { game_uid: '11454', name: 'Plinko', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11454.png' },
  { game_uid: '11362', name: 'Poison Teenpatti 20 20', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11362.png' },
  { game_uid: '11524', name: 'Poker 1-Day', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11524.png' },
  { game_uid: '11423', name: 'Poker 20-20', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11423.png' },
  { game_uid: '11394', name: 'Pump', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11394.png' },
  { game_uid: '11448', name: 'Pushpa Rani', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11448.png' },
  { game_uid: '11415', name: 'Queen Race', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11415.png' },
  { game_uid: '11414', name: 'Race 20', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11414.png' },
  { game_uid: '11514', name: 'Race to 17', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11514.png' },
  { game_uid: '11396', name: 'Race Track', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11396.png' },
  { game_uid: '11444', name: 'Rock Paper Scissors', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11444.png' },
  { game_uid: '11424', name: 'Roulette', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11424.png' },
  { game_uid: '11369', name: 'Sexy 2 Card Teenpatti', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11369.png' },
  { game_uid: '11376', name: 'Sexy Amar Akbar Anthony', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11376.png' },
  { game_uid: '11373', name: 'Sexy Dragon Tiger', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11373.png' },
  { game_uid: '11372', name: 'Sexy Dragon tiger 2', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11372.png' },
  { game_uid: '11375', name: 'Sexy High Low', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11375.png' },
  { game_uid: '11374', name: 'Sexy Lucky 7', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11374.png' },
  { game_uid: '11368', name: 'Sexy Lucky 7 -2', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11368.png' },
  { game_uid: '11371', name: 'Sexy Lucky 7 -3', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11371.png' },
  { game_uid: '11370', name: 'Sexy Teenpatti 20-20', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11370.png' },
  { game_uid: '11425', name: 'Sic Bo', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11425.png' },
  { game_uid: '11441', name: 'Sky fall', category: 'crash', hot: false, new: false , img: 'https://igamingapis.com/img/11441.png' },
  { game_uid: '11386', name: 'Snakes', category: 'slots', hot: false, new: false , img: 'https://igamingapis.com/img/11386.png' },
  { game_uid: '11410', name: 'Speed Auto Roulette', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11410.png' },
  { game_uid: '11395', name: 'Stock Matka', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11395.png' },
  { game_uid: '11505', name: 'Super Over', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11505.png' },
  { game_uid: '11408', name: 'Teenpatti Joker 20-20', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11408.png' },
  { game_uid: '11498', name: 'Teenpatti Joker One Day', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11498.png' },
  { game_uid: '11420', name: 'Teenpatti One Day', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11420.png' },
  { game_uid: '11381', name: 'The Voice', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11381.png' },
  { game_uid: '11438', name: 'Trade88 BNBUSD', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11438.png' },
  { game_uid: '11437', name: 'Trade88 BTCUSD', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11437.png' },
  { game_uid: '11384', name: 'Trade88 ETHUSD', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11384.png' },
  { game_uid: '11439', name: 'Trade88 EURUSD', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11439.png' },
  { game_uid: '11435', name: 'Trade88 GOLD', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11435.png' },
  { game_uid: '11436', name: 'Trade88 LTCUSD', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11436.png' },
  { game_uid: '11397', name: 'Trade88 NATURAL GAS', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11397.png' },
  { game_uid: '11433', name: 'Trade88 OIL', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11433.png' },
  { game_uid: '11440', name: 'Trade88 RNG', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11440.png' },
  { game_uid: '11377', name: 'Trade88 RNG2', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11377.png' },
  { game_uid: '11434', name: 'Trade88 SILVER', category: 'casual', hot: false, new: false , img: 'https://igamingapis.com/img/11434.png' },
  { game_uid: '11385', name: 'Trade88 SOLUSD', category: 'virtual', hot: false, new: false , img: 'https://igamingapis.com/img/11385.png' },
  { game_uid: '11538', name: 'Trio', category: 'table', hot: false, new: false , img: 'https://igamingapis.com/img/11538.png' },
  { game_uid: '11409', name: 'Turbo Auto Roulette', category: 'table', hot: true, new: false , img: 'https://igamingapis.com/img/11409.png' },

  // ── LuckySport ───────────────────────────────────────────────────────────
  { game_uid: '7004', name: 'LuckSportGaming', category: 'lucky', hot: true, new: true, img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7004/public' },

  // ── Evolution Live (Asia) ────────────────────────────────────────────────
  { game_uid: '7605', name: 'American Roulette',                    category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7605/public' },
  { game_uid: '8190', name: 'Auto Lightning Roulette',              category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8190/public' },
  { game_uid: '7607', name: 'Bac Bo',                               category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7607/public' },
  { game_uid: '7845', name: 'Balloon Race',                         category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7845/public' },
  { game_uid: '7834', name: 'Blackjack A',                          category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7834/public' },
  { game_uid: '8030', name: 'Blackjack Classic 73',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8030/public' },
  { game_uid: '8031', name: 'Blackjack Classic 74',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8031/public' },
  { game_uid: '8032', name: 'Blackjack Classic 75',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8032/public' },
  { game_uid: '8033', name: 'Blackjack Classic 76',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8033/public' },
  { game_uid: '8034', name: 'Blackjack Classic 77',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8034/public' },
  { game_uid: '8019', name: 'Blackjack Classic 84',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8019/public' },
  { game_uid: '7743', name: 'Blackjack VIP 17',                     category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7743/public' },
  { game_uid: '7745', name: 'Blackjack VIP 19',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7745/public' },
  { game_uid: '7724', name: 'Blackjack VIP 21',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7724/public' },
  { game_uid: '7725', name: 'Blackjack VIP 22',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7725/public' },
  { game_uid: '7754', name: 'Blackjack VIP 28',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7754/public' },
  { game_uid: '7755', name: 'Blackjack VIP 29',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7755/public' },
  { game_uid: '7775', name: 'Blackjack VIP 30',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7775/public' },
  { game_uid: '7773', name: 'Blackjack VIP 31',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7773/public' },
  { game_uid: '7774', name: 'Blackjack VIP 32',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7774/public' },
  { game_uid: '7795', name: 'Blackjack VIP 33',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7795/public' },
  { game_uid: '7796', name: 'Blackjack VIP 34',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7796/public' },
  { game_uid: '7797', name: 'Blackjack VIP 35',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7797/public' },
  { game_uid: '7799', name: 'Blackjack VIP 36',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7799/public' },
  { game_uid: '7800', name: 'Blackjack VIP 37',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7800/public' },
  { game_uid: '7798', name: 'Blackjack VIP 38',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7798/public' },
  { game_uid: '8095', name: 'Blackjack VIP 39',                     category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8095/public' },
  { game_uid: '7801', name: 'Blackjack VIP 41',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7801/public' },
  { game_uid: '7803', name: 'Blackjack VIP 44',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7803/public' },
  { game_uid: '8101', name: 'Blackjack VIP 48',                     category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8101/public' },
  { game_uid: '8102', name: 'Blackjack VIP 49',                     category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8102/public' },
  { game_uid: '8097', name: 'Blackjack VIP 50',                     category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8097/public' },
  { game_uid: '8103', name: 'Blackjack VIP 51',                     category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8103/public' },
  { game_uid: '7846', name: 'Bonsai Speed Baccarat A',              category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7846/public' },
  { game_uid: '7847', name: 'Bonsai Speed Baccarat B',              category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7847/public' },
  { game_uid: '7848', name: 'Bonsai Speed Baccarat C',              category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7848/public' },
  { game_uid: '7644', name: "Casino Hold'em",                       category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7644/public' },
  { game_uid: '7614', name: 'Craps',                                category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7614/public' },
  { game_uid: '8204', name: 'Crazy Balls',                          category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8204/public' },
  { game_uid: '7615', name: 'Crazy Coin Flip',                      category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7615/public' },
  { game_uid: '7616', name: 'Crazy Pachinko',                       category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7616/public' },
  { game_uid: '7624', name: 'Dragon Tiger',                         category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7624/public' },
  { game_uid: '8201', name: 'Dragon Tiger Phoenix',                 category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8201/public' },
  { game_uid: '8189', name: 'Dragonara Roulette',                   category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8189/public' },
  { game_uid: '8064', name: 'Emperor Bac Bo',                       category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8064/public' },
  { game_uid: '7751', name: 'Emperor Dragon Tiger',                 category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7751/public' },
  { game_uid: '7753', name: 'Emperor Roulette',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7753/public' },
  { game_uid: '7627', name: 'Emperor Sic Bo',                       category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7627/public' },
  { game_uid: '7886', name: 'Emperor Sic Bo A',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7886/public' },
  { game_uid: '7752', name: 'Emperor Speed Baccarat A',             category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7752/public' },
  { game_uid: '7750', name: 'Emperor Speed Baccarat B',             category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7750/public' },
  { game_uid: '8049', name: 'Emperor Speed Baccarat C',             category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8049/public' },
  { game_uid: '8051', name: 'Emperor Speed Baccarat D',             category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8051/public' },
  { game_uid: '10485', name: 'Evolution Blackjack',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/10485/public' },
  { game_uid: '10487', name: 'Evolution Lobby',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/10487/public' },
  { game_uid: '10486', name: 'Evolution Poker',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/10486/public' },
  { game_uid: '7900', name: 'Extra Chilli Epic Spins Live',         category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7900/public' },
  { game_uid: '7787', name: 'First Person American Roulette',       category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7787/public' },
  { game_uid: '7785', name: 'First Person Golden Wealth Baccarat',  category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7785/public' },
  { game_uid: '8076', name: 'First Person HiLo',                    category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8076/public' },
  { game_uid: '7786', name: 'First Person Lightning Baccarat',      category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7786/public' },
  { game_uid: '7781', name: 'First Person Lightning Blackjack',     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7781/public' },
  { game_uid: '8074', name: 'First Person Prosperity Tree Baccarat',category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8074/public' },
  { game_uid: '8077', name: 'First Person Super Sic Bo',            category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8077/public' },
  { game_uid: '7901', name: 'First Person Video Poker',             category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7901/public' },
  { game_uid: '8078', name: 'First Person XXXtreme Lightning Baccarat', category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8078/public' },
  { game_uid: '8075', name: 'First Person XXXtreme Lightning Roulette', category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8075/public' },
  { game_uid: '7832', name: 'Football Studio Dice',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7832/public' },
  { game_uid: '7844', name: 'Football Studio Roulette',             category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7844/public' },
  { game_uid: '7859', name: 'Free Bet Blackjack 11',                category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7859/public' },
  { game_uid: '7612', name: 'Free Bet VIP Blackjack A',             category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7612/public' },
  { game_uid: '7611', name: 'Free Bet VIP Blackjack B',             category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7611/public' },
  { game_uid: '7637', name: 'Funky Time',                           category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7637/public' },
  { game_uid: '7641', name: 'Gold Vault Roulette',                  category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7641/public' },
  { game_uid: '7903', name: 'Golden Wealth Baccarat',               category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7903/public' },
  { game_uid: '8195', name: 'Hindi Lightning Roulette',             category: 'evolution', hot: true,  new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8195/public' },
  { game_uid: '8202', name: 'Ice Fishing',                          category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8202/public' },
  { game_uid: '8163', name: 'Infinite Fun Fun 21 Blackjack',        category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8163/public' },
  { game_uid: '7914', name: 'Lightning Ball',                       category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7914/public' },
  { game_uid: '7917', name: 'Lightning Blackjack',                  category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7917/public' },
  { game_uid: '7656', name: 'Lightning Dragon Tiger',               category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7656/public' },
  { game_uid: '7916', name: 'Lightning Sic Bo',                     category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7916/public' },
  { game_uid: '7918', name: 'Lightning Storm',                      category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7918/public' },
  { game_uid: '7741', name: 'Peek Baccarat',                        category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7741/public' },
  { game_uid: '8048', name: 'Prosperity Tree Baccarat',             category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8048/public' },
  { game_uid: '7778', name: 'Red Door Roulette',                    category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7778/public' },
  { game_uid: '7835', name: 'Roulette',                             category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7835/public' },
  { game_uid: '7654', name: 'Speed Baccarat A',                     category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7654/public' },
  { game_uid: '7662', name: 'Speed Baccarat B',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7662/public' },
  { game_uid: '7680', name: 'Speed Baccarat C',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7680/public' },
  { game_uid: '7681', name: 'Speed Baccarat D',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7681/public' },
  { game_uid: '7677', name: 'Speed Baccarat E',                     category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7677/public' },
  { game_uid: '7658', name: 'Speed Roulette',                       category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7658/public' },
  { game_uid: '7843', name: 'Super Speed Baccarat',                 category: 'evolution', hot: false, new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7843/public' },
  { game_uid: '7606', name: 'Super Andar Bahar',                    category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7606/public' },
  { game_uid: '8200', name: 'Super Color Game',                     category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8200/public' },
  { game_uid: '7829', name: 'Teen Patti',                           category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7829/public' },
  { game_uid: '8183', name: 'Video Poker',                          category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8183/public' },
  { game_uid: '8184', name: 'XXXtreme Lightning Baccarat',          category: 'evolution', hot: true,  new: false , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8184/public' },
  { game_uid: '8185', name: 'Squeeze Baccarat',                     category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/8185/public' },
  { game_uid: '7827', name: 'Stock Market',                         category: 'evolution', hot: false, new: true  , img: 'https://imagedelivery.net/nVyft9zNw2I0pNVtrnC1zA/7827/public' },
]

export const getLiveGames = async (req, res) => {
  try {
    const { category } = req.query
    const games = category && category !== 'all'
      ? LIVE_GAMES.filter(g => g.category === category)
      : LIVE_GAMES
    res.json({ success: true, games, total: games.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const launchGame = async (req, res) => {
  try {
    const { game_uid, language = 'hi', currency_code = 'INR' } = req.body
    const user = await User.findById(req.user._id)
    if (!user)          return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' })

    // FIX 1: Balance check - minimum ₹1 required
    if (user.balance < 1) {
      return res.status(400).json({ success: false, message: 'Insufficient balance. Minimum ₹1 required.' })
    }

    // FIX 2: Generate softagiId if not exists and save to DB
    if (!user.softagiId) {
      user.softagiId = Math.floor(100000 + Math.random() * 900000)
      await user.save()
      console.log(`Generated softagiId=${user.softagiId} for user=${user.username}`)
    }

    const FRONTEND = process.env.FRONTEND_URL || 'https://casino-platform-1.onrender.com'
    const BACKEND  = process.env.BACKEND_URL  || 'https://casino-platform-8os6.onrender.com'

    const payload = {
      user_id:       String(user.softagiId),
      balance:       parseFloat(user.balance.toFixed(2)),
      game_uid:      String(game_uid),
      token:         TOKEN,
      timestamp:     Date.now(),
      return:        `${FRONTEND}/live-casino/return`,
      callback:      `${BACKEND}/api/live-casino/callback`,
      currency_code,
      language,
    }

    const encrypted = encryptPayload(payload, SECRET)
    const launchUrl = `${SERVER}?payload=${encodeURIComponent(encrypted)}&token=${encodeURIComponent(TOKEN)}`

    const apiResp = await fetch(launchUrl, { method: 'GET' })
      .catch(err => { throw new Error(`API unreachable: ${err.message}`) })

    const apiData = await apiResp.json()

    if (apiData.code !== 0) {
      return res.status(400).json({ success: false, message: apiData.msg || 'Launch failed', code: apiData.code })
    }

    console.log(`Game launched: user=${user.username} softagiId=${user.softagiId} game=${game_uid} balance=${payload.balance}`)
    res.json({ success: true, gameUrl: apiData.data?.url, game_uid, balance: user.balance })
  } catch (err) {
    console.error('launchGame error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

export const gameCallback = async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { game_uid, game_round, member_account, bet_amount, win_amount } = req.body

    console.log('CB:', JSON.stringify({ member_account, bet_amount, win_amount, game_round }))

    if (!member_account) {
      return res.json({ credit_amount: -1, error: 'Missing member_account' })
    }

    const bet = parseFloat(bet_amount) || 0
    const win = parseFloat(win_amount) || 0

    // Skip empty callbacks
    if (bet === 0 && win === 0) {
      return res.json({ credit_amount: 0, timestamp: Date.now() })
    }

    // Find user
    let user = await User.findOne({ softagiId: Number(member_account) })
    if (!user) user = await User.findById(member_account).catch(() => null)
    if (!user) {
      console.error('User not found:', member_account)
      return res.json({ credit_amount: 0, timestamp: Date.now() })
    }

    // Skip duplicate rounds
    if (game_round) {
      const existing = await Bet.findOne({ 'result.game_round': game_round, userId: user._id })
      if (existing) {
        console.log('Duplicate skipped:', game_round)
        return res.json({ credit_amount: Math.max(0, bet - win), timestamp: Date.now() })
      }
    }

    // Calculate net change
    const net = win - bet
    const balanceBefore = user.balance

    // Update balance
    user.balance = Math.max(0, user.balance + net)
    await user.save()

    // Record bet
    if (bet > 0 || win > 0) {
      await Bet.create({
        userId: user._id,
        game: 'live-casino',
        betAmount: Math.max(1, bet),
        payout: win,
        profit: net,
        status: win >= bet ? 'won' : 'lost',
        result: { game_uid, game_round },
        settledAt: new Date(),
      }).catch(e => console.log('Bet create error:', e.message))

      await WalletTransaction.create({
        userId: user._id,
        type: net > 0 ? 'game_win' : 'game_bet',
        amount: Math.abs(net),
        balanceBefore,
        balanceAfter: user.balance,
        description: 'Live Casino',
      }).catch(e => console.log('Wallet create error:', e.message))
    }

    const credit = Math.max(0, bet - win)
    console.log('CB OK: bet=' + bet + ' win=' + win + ' net=' + net + ' balance=' + user.balance)
    res.json({ credit_amount: credit, timestamp: Date.now() })
  } catch (err) {
    console.error('CB Error:', err.message)
    res.json({ credit_amount: -1, error: err.message })
  }
}

export const getLiveBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance username')
    if (!user) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, balance: user.balance, username: user.username })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
