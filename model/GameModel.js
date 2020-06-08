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
      scores: [],
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
    if(lastRound[0] && lastRound[1] || (!beforeLastRound[0] || !beforeLastRound[1])) {
      rounds[lastIndex] = lastRound
    } else {
      rounds.push(lastRound)
    }

    if(lastRound[0] && lastRound[1]) {
      calculateScores()
    }

    function calculateScores() {
      const scores = $game.get('score') || [0, 0]
      const lastRoundScores = scores[scores.length - 1] || [0, 0]

      const scoreSeries = scores.reduce((acc, score) => {
        if(acc.scores  !== score[isProfessor ? 0 : 1] || acc.opponent === score[isProfessor ? 1 : 0]) {
          return {series: acc.series + 1, scores: score}
        }
      }, {series: 0, scores: 0, opponent: 0})

      const plusScore = Array(scoreSeries.series).fill(1).reduce((acc) => {
        acc = acc * 2
        return acc
      }, 1)

      console.info("__scoreSeries__", scoreSeries)

      const beforeLastIndex = lastIndex ? scores[lastIndex] - 1 : scores[lastIndex]

      if(plusScore) {
        if(whoWin(lastRound) === 0) {
          scores[lastIndex] = [scores[beforeLastIndex][0] + plusScore, scores[beforeLastIndex][1]]
          $game.set('scores', scores)
        } else {
          scores[lastIndex] = [scores[beforeLastIndex][0], scores[beforeLastIndex][1] + plusScore]
          $game.set('scores', scores)
        }
        // const professorScore = isProfessor ? lastRoundScores[0] + plusScore
        // scores[lastIndex] = [isProfessor ? lastRoundScores[0] + plusScore]
        //
        // $game.set('scores', [isProfessor ? scores[0] plusScore])
      } else {
        $game.set('scores', [scores[beforeLastIndex][0]], scores[beforeLastIndex][1])

        // lastRoundScores
      }
    }

    function whoWin(lastRound) {
      const professor = lastRound[0]
      const secondPlayer = lastRound[1]

      if(professor === secondPlayer) return DRAW

      for(let action in ACTIONS) {
        if(action.type === professor && action.beat === secondPlayer) {
          return 0
        } else if(action.type === secondPlayer && action.beat === professor) {
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

    $game.push('rounds', [])
    $game.push('scores', [])
  }
}
