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

  return getScoresByRound(resultsByRound)

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
    console.info("__acc.result__", acc.result)
    let lastResult = acc.result[acc.result.length ? acc.result.length - 1 : acc.result.length] || [0, 0]

    console.info("__lastResult__", lastResult)
    if(result === DRAW) {
      console.info("__0__", acc)
      acc.result.push(lastResult)
      return acc
    } else if(acc.currentWinner === result) {
      acc.series += 1
      console.info("__1__", acc)
    } else {
      acc.series = 1
      acc.currentWinner = result
      console.info("__2__", acc)
    }

    const plusScore = getScoreBySeries(acc.series)

    if(result === 0) {
      console.info("__4__", acc)
      acc.result.push([lastResult[0] + plusScore, lastResult[1]])
      return acc
    } else if (result === 1) {
      acc.result.push([lastResult[0], lastResult[1] + plusScore])
      console.info("__5__", acc)
      return acc
    } else {
      const lastResult = acc.result[acc.result.length - 1] || [0, 0]
      acc.result.push(lastResult)
      console.info("__6__", acc)
      return acc
    }
    return acc
  }, {series: 0, currentWinner: -1, result: []}).result
}

function getScoreBySeries (series) {
  return Array(series).fill(1).reduce((acc, _, i) => {
    if(!i) {
      acc = acc + (i + 1)
    } else {
      acc += i
    }
    return acc
  }, 0)
}
