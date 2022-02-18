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
      currentRound: 1,
      playerIds: [],
      id
    })
    return id
  }

  async join({gameId, playerId}) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)

    const professorId = $game.get('profId')
    const playerIds = $game.get('playerIds')

    if(!playerIds.includes(playerId)) {
      $game.push('playerIds', playerId)
    }

    return true
  }

  async surrender({ gameId, playerId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    $game.set('open', false)
    $game.set('cause', { type: SURRENDER, playerId })

    return true
  }

  async nextRound({ gameId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    const currentRound = $game.get('currentRound')
    $game.set('currentRound', currentRound + 1)
  }

  async finishGame({ gameId }) {
    const $game = this.scope(`games.${gameId}`)
    await this.root.subscribe($game)
    $game.set('open', false)

    return true
  }
}
