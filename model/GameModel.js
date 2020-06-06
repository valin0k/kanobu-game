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

    const lastRoundIndex = (rounds.length - 1) < 1 ? 0 : rounds.length - 1
    const beforeLastRound = rounds[lastRoundIndex - 1] || []
    const lastRound = rounds[lastRoundIndex] || []
    lastRound[isProfessor ? 0 : 1] = action
    if(lastRound[0] && lastRound[1] || (!beforeLastRound[0] || !beforeLastRound[1])) {
      rounds[lastRoundIndex] = lastRound
    } else {
      rounds.push(lastRound)
    }
    $game.set('rounds', rounds)
    return true
  }

  async surrender({ gameId, userId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    $game.set('open', false)
    $game.set('cause', SURRENDER)

    return true
  }


}
