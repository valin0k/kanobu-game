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
  const answersLength = Math.min(user1.answers.length, user2.answers.length)

  const resultsByRound = Array(answersLength).fill(1).map((_, i) => {
    return _whoWin(user1.answers[i], user2.answers[i])
  })

  const aaaa = getScoresByRound(resultsByRound)
console.info("__aaaa__", aaaa)

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

function getScoresByRound (resultsByRound) {
  return resultsByRound.reduce((acc, result, i) => {
    if(result === 0) {
      const plusScore = getScoreBySeries(acc.currentWinner === 0 ? acc.series + 1 : acc.series)
      const result = [acc.result[i][0] ? acc.result[i][0] + plusScore : plusScore, acc.result[1] || 0]
      return {series: acc.series + 1, currentWinner: 0, result}
    } else if (result === 1) {
      const plusScore = getScoreBySeries(acc.currentWinner === 1 ? acc.series + 1 : acc.series)
      const result = [acc.result[i][0] ? acc.result[i][0] + plusScore : plusScore, acc.result[1] || 0]
      return {series: acc.series + 1, currentWinner: 0, result}
    } else {
      const lastResult = acc.result[acc.result.length - 1] || [0, 0]
      acc.result.push(lastResult)
      return acc
    }
    return acc
  }, {series: 0, currentWinner: -1, result: []})
}

function getScoreBySeries (series) {
  return Array(series).fill(1).reduce((acc, _, i) => {
    if(!i) {
      acc = acc + (i + 1)
    } else {
      acc += i
    }
    return acc
  }, 1)
}
