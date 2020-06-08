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
      console.info("__scores__", scores.slice(0))
      const lastRoundScores = scores[scores.length - 1] || [0, 0]
      console.info("__lastRoundScores__", lastRoundScores)
      const scoresBeforeCurrent = scores.slice(0, -1)
      console.info("__scoresBeforeCurrent__", scoresBeforeCurrent)
      const scoreSeries = scoresBeforeCurrent.reduce((acc, score) => {
        if(acc.scores !== score[isProfessor ? 0 : 1] || acc.opponent === score[isProfessor ? 1 : 0]) {
          return {series: acc.series + 1, scores: score}
        }
        return acc
      }, {series: 0, scores: 0, opponent: 0})

      console.info("__scoreSeries__", scoreSeries)

      const plusScore = Array(scoreSeries.series).fill(1).reduce((acc) => {
        acc = acc * 2
        return acc
      }, 1)

      console.info("__plusScore__", plusScore)


      console.info("______________________________________", )
      console.info("__scores__", scores)
      console.info("__lastIndex__", lastIndex)
      console.info("__scores[lastIndex]__", scores[lastIndex])

      const beforeLastIndex = lastIndex ? scores[lastIndex - 1] : scores[lastIndex]
      console.info("__beforeLastIndex__", beforeLastIndex)

      if(plusScore) {
        if(whoWin(lastRound) === 0) {
          scores[lastIndex] = [beforeLastIndex[0] + plusScore, beforeLastIndex[1]]
          console.info("__scores_after__", scores)
          $game.set('scores', scores)
        } else {
          scores[lastIndex] = [beforeLastIndex[0], beforeLastIndex[1] + plusScore]
          console.info("__scores_after__", scores)
          $game.set('scores', scores)
        }
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
