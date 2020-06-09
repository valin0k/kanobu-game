import { BaseModel } from 'startupjs/orm'

export const SURRENDER = 'surrender'
export const DRAW = 'draw'
export const PAPER = 'paper'
export const STONE = 'stone'
export const CUT = 'cut'

export const ACTIONS = [
  { type: PAPER, beat: STONE },
  { type: STONE, beat: CUT },
  { type: CUT, beat: PAPER }
]

export default class UserModel extends BaseModel {
  async add(data = {}) {
    let id = this.id()
    await this.root.add(this, {
      ...data,
      createdAt: Date.now(),
      open: true,
      rounds: [],
      scores: [[0, 0]],
      id
    })
    return id
  }

  async join({gameId, userId}) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)

    const professorId = $game.get('professor')

    if(professorId !== userId) {
      $game.set('opponent', userId)
    }

    return true
  }

  async selectAction({gameId, isProfessor, action}) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    const rounds = $game.get('rounds')

    const lastIndex = (rounds.length - 1) < 1 ? 0 : rounds.length - 1
    const beforeLastRound = rounds[lastIndex - 1] || []
    const lastRound = rounds[lastIndex] || []
    lastRound[isProfessor ? 0 : 1] = action
    if((lastRound[0] || lastRound[1]) || (!beforeLastRound[0] || !beforeLastRound[1])) {
      rounds[lastIndex] = lastRound
    } else {
      rounds.push(lastRound)
    }

    if(lastRound[0] && lastRound[1]) {
      calculateScores()
    }

    function calculateScores() {
      const scores = $game.get('scores') || [[0, 0]]
      const lastRoundScores = scores[scores.length - 1] || [0, 0]
      const scoresBeforeCurrent = scores.slice(0, -1)
      const roundsBeforeCurrent = rounds.slice(0, -1)

      const winner = whoWin(lastRound)
      // console.info("__scoresBeforeCurrent__", scoresBeforeCurrent)
console.info("__winner__", winner)

      const scoreSeries = roundsBeforeCurrent.reduceRight((acc, round) => {
        const roundWinner = whoWin(round)
        const skip = { series: acc.series, currentWinner: 'skip' }

        if(roundWinner !== winner && roundWinner !== DRAW) return skip
        if(acc.currentWinner === 'skip') return skip

        if(roundWinner === DRAW) {
          console.info("__DRAWwwww__", )
          return acc
        } else if (roundWinner === 1 && (acc.currentWinner === 'no' || acc.currentWinner === 1)) {
          console.info("__11111111111111111111__", )
          acc = {series: acc.series + 1, currentWinner: 1}
          return acc
        } else if (!roundWinner && (acc.currentWinner === 'no' || acc.currentWinner === 0)) {
          acc = {series: acc.series + 1, currentWinner: 0}
          console.info("__000000000000000000__", )
          return acc
        }
        return acc
      }, { series: 0, currentWinner: 'no' }) //.series


      // const scoreSeries = scoresBeforeCurrent.reduceRight((acc, score) => {
      //   if(winner === DRAW) {
      //     console.info("__DRAWwwww__", )
      //     return acc
      //   } else if (winner === 1 && (acc.currentWinner === 'no' || acc.currentWinner === 1)) {
      //     console.info("__11111111111111111111__", )
      //     acc = {series: acc.series + 1, currentWinner: 1}
      //     return acc
      //   } else if (!winner && (acc.currentWinner === 'no' || acc.currentWinner === 0)) {
      //     acc = {series: acc.series + 1, currentWinner: 0}
      //     console.info("__000000000000000000__", )
      //     return acc
      //   }
      //   return acc
      // }, { series: 0, prevScores: 0, currentWinner: 'no' }) //.series

      console.info("__scoreSeries__", scoreSeries)

      let plusScore = Array(scoreSeries.series).fill(1).reduce((acc, _, i) => {
        acc = acc * 2
        return acc
      }, 1)

      plusScore = plusScore > 1 ? plusScore - 1 : plusScore

      console.info("__plusScore__", plusScore)


      console.info("______________________________________", )
      console.info("__scores__", scores)
      console.info("__lastIndex__", lastIndex)
      console.info("__scores[lastIndex]__", scores[lastIndex])

      const beforeLastIndex = lastIndex ? scores[lastIndex - 1] : scores[lastIndex]
      console.info("__beforeLastIndex__", beforeLastIndex)

      if(!winner) {
        scores[lastIndex] = [beforeLastIndex[0] + plusScore, beforeLastIndex[1]]
        console.info("__scores_after__", scores)
        $game.set('scores', scores)
      } else if(winner === 1) {
        scores[lastIndex] = [beforeLastIndex[0], beforeLastIndex[1] + plusScore]
        console.info("__scores_after__", scores)
        $game.set('scores', scores)
      } else if(winner === DRAW) {
        console.info("__FRAWWWWWWWWWWWWWW__", )
        scores[lastIndex] = [beforeLastIndex[0], beforeLastIndex[1]]
        $game.set('scores', scores)
      }

      // if(plusScore) {
      //   if(whoWin(lastRound) === 0) {
      //     scores[lastIndex] = [beforeLastIndex[0] + plusScore, beforeLastIndex[1]]
      //     console.info("__scores_after__", scores)
      //     $game.set('scores', scores)
      //   } else {
      //     scores[lastIndex] = [beforeLastIndex[0], beforeLastIndex[1] + plusScore]
      //     console.info("__scores_after__", scores)
      //     $game.set('scores', scores)
      //   }
      // } else {
      //   console.info("__FRAWWWWWWWWWWWWWW__", )
      //   $game.set('scores', [scores[beforeLastIndex][0]], scores[beforeLastIndex][1])
      //
      //   // lastRoundScores
      // }
    }

    function whoWin(lastRound) {
      const professor = lastRound[0]
      const secondPlayer = lastRound[1]

      if(professor === secondPlayer) return DRAW

      for(let action of ACTIONS) {
        console.info("______________________________", )
        console.info("__professor__", professor)
        console.info("__secondPlayer__", secondPlayer)
        console.info("__action.type__", action.type)
        console.info("__action.beat__", action.beat)
        console.info("__action__", action)

        if(action.type === professor && action.beat === secondPlayer) {
          return 0
        } else if(action.type === secondPlayer && action.beat === professor) {
          return 1
        }
      }
      console.info("__AAAAAAAAAAAAAAAAAAAAAA__", )
    }

    console.info("__rounds__", rounds)
    $game.set('rounds', rounds)
    return true
  }

  async surrender({ gameId, userId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    $game.set('open', false)
    $game.set('cause', { type: SURRENDER, userId: userId })

    return true
  }

  async nextRound({ gameId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    const rounds = $game.get('rounds')
    const scores = $game.get('scores')

    $game.push('rounds', [])
    $game.push('scores', scores[scores.length - 1])
  }
}
