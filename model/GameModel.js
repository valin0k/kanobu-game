import { BaseModel } from 'startupjs/orm'

const SURRENDER = 'surrender'


export default class UserModel extends BaseModel {
  async add(data = {}) {
    let id = this.id()
    await this.root.addAsync(this, {
      ...data,
      createdAt: Date.now(),
      open: true,
      rounds: [],
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

    const scores = $game.get('score') || []
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
    $game.set('scores', plusScore)


    // await this._setScore()

    $game.set('rounds', rounds)
    return true
  }

  async _setScore({}) {

  }

  async surrender({ gameId, userId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    $game.set('open', false)
    $game.set('cause', SURRENDER)

    return true
  }


}
