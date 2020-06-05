import { BaseModel } from 'startupjs/orm'

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
    await this.root.subscribeAsync($game)

    $game.set('opponent', userId)
    return true
  }
}
