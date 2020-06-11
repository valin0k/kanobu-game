// import {ACTIONS, CUT, DRAW, PAPER, STONE} from "model/GameModel"

const DRAW = 'draw'
export const PAPER = 'paper'
export const STONE = 'stone'
export const CUT = 'cut'

const ACTIONS = [
  { type: PAPER, beat: STONE },
  { type: STONE, beat: CUT },
  { type: CUT, beat: PAPER }
]

export default function getScores (user1, user2) {
  console.info("__user1__", user1)
  console.info("__user2__", user2)
  const answersLength = Math.min(user1.answers.length, user2.answers.length)

  const getWinnersByRound = Array(answersLength).fill(1).map((_, i) => {
    return _whoWin(user1.answers[i], user2.answers[i])
  })

  


  console.info("__getWinnersByRound__", getWinnersByRound)
}

function _whoWin(user1Answer, user2Answer) {
  if(user1Answer === user2Answer) return DRAW

  for(let action of ACTIONS) {
    if(action.type === user1Answer && action.beat === user2Answer) {
      return 0
    } else if(action.type === user2Answer && action.beat === user1Answer) {
      return 1
    }
  }
}

// function getScoreSeries() {
//   return roundsBeforeCurrent.reduceRight((acc, round) => {
//     const roundWinner = whoWin(round)
//     const skip = { series: acc.series, currentWinner: 'skip' }
//
//     if(roundWinner !== winner && roundWinner !== DRAW) return skip
//     if(acc.currentWinner === 'skip') return skip
//
//     if(roundWinner === DRAW) {
//       return acc
//     } else if (roundWinner === 1 && (acc.currentWinner === 'no' || acc.currentWinner === 1)) {
//       acc = {series: acc.series + 1, currentWinner: 1}
//       return acc
//     } else if (!roundWinner && (acc.currentWinner === 'no' || acc.currentWinner === 0)) {
//       acc = {series: acc.series + 1, currentWinner: 0}
//       return acc
//     }
//     return acc
//   }, { series: 0, currentWinner: 'no' })
// }
