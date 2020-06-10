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
  async addGame(data = {}) {
    let id = this.id()
    await this.root.add(this, {
      ...data,
      createdAt: Date.now(),
      open: true,
      rounds: [],
      scores: [[0, 0]],
      userIds: [],
      id
    })
    return id
  }

  async join({gameId, userId}) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)

    const professorId = $game.get('professor')
    const userIds = $game.get('userIds')

    if(professorId !== userId && !userIds.includes(userId)) {
      $game.push('userIds', userId)
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
      const scoreSeries = roundsBeforeCurrent.reduceRight((acc, round) => {
        const roundWinner = whoWin(round)
        const skip = { series: acc.series, currentWinner: 'skip' }

        if(roundWinner !== winner && roundWinner !== DRAW) return skip
        if(acc.currentWinner === 'skip') return skip

        if(roundWinner === DRAW) {
          return acc
        } else if (roundWinner === 1 && (acc.currentWinner === 'no' || acc.currentWinner === 1)) {
          acc = {series: acc.series + 1, currentWinner: 1}
          return acc
        } else if (!roundWinner && (acc.currentWinner === 'no' || acc.currentWinner === 0)) {
          acc = {series: acc.series + 1, currentWinner: 0}
          return acc
        }
        return acc
      }, { series: 0, currentWinner: 'no' })

      let plusScore = Array(scoreSeries.series).fill(1).reduce((acc, _, i) => {
        if(!i) {
          acc = acc + (i + 1)
        } else {
          acc += i
        }
        return acc
      }, 1)

      plusScore = plusScore > 1 ? plusScore - 1 : plusScore
      const beforeLastIndex = lastIndex ? scores[lastIndex - 1] : scores[lastIndex]

      if(!winner) {
        scores[lastIndex] = [beforeLastIndex[0] + plusScore, beforeLastIndex[1]]
        $game.set('scores', scores)
      } else if(winner === 1) {
        scores[lastIndex] = [beforeLastIndex[0], beforeLastIndex[1] + plusScore]
        $game.set('scores', scores)
      } else if(winner === DRAW) {
        scores[lastIndex] = [beforeLastIndex[0], beforeLastIndex[1]]
        $game.set('scores', scores)
      }
    }

    function whoWin(lastRound) {
      const firstPlayer = lastRound[0]
      const secondPlayer = lastRound[1]
      if(firstPlayer === secondPlayer) return DRAW

      for(let action of ACTIONS) {
        if(action.type === firstPlayer && action.beat === secondPlayer) {
          return 0
        } else if(action.type === secondPlayer && action.beat === firstPlayer) {
          return 1
        }
      }
    }

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

  async finishGame({ gameId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    $game.set('open', false)

    return true
  }
}
