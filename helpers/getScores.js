import { ACTIONS, DRAW, PAPER, STONE, CUT } from 'model/GameModel'

export default function getScores (user1, user2) {
  const answersLength = Math.min(user1.answers.length, user2.answers.length)

  const resultsByRound = Array(answersLength).fill(1).map((_, i) => {
    return whoWin(user1.answers[i], user2.answers[i])
  })

  return getScoresByRound(resultsByRound)
}

function whoWin(user1Answer, user2Answer) {
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
    let lastResult = acc.result[acc.result.length ? acc.result.length - 1 : acc.result.length] || [0, 0]

    if(result === DRAW) {
      acc.result.push(lastResult)
      return acc
    } else if(acc.currentWinner === result) {
      acc.series += 1
    } else {
      acc.series = 1
      acc.currentWinner = result
    }

    const plusScore = getScoreBySeries(acc.series)

    if(result === 0) {
      acc.result.push([lastResult[0] + plusScore, lastResult[1]])
      return acc
    } else if (result === 1) {
      acc.result.push([lastResult[0], lastResult[1] + plusScore])
      return acc
    } else {
      const lastResult = acc.result[acc.result.length - 1] || [0, 0]
      acc.result.push(lastResult)
      return acc
    }
    return acc
  }, {series: 0, currentWinner: -1, result: []}).result
}

function getScoreBySeries (series) {
  return Array(series).fill(1).reduce((acc, _, i) => {
    if(!i || i === 1) {
      acc = acc + 1
    } else {
      acc = acc * 2
    }
    return acc
  }, 0)
}
