import { BaseModel } from 'startupjs/orm'

export default class PlayerModel extends BaseModel {
  async addPlayer (data = {}) {
    const id = this.id()
    await this.root.add(this, {
      ...data,
      createdAt: Date.now(),
      answers: [],
      id
    })
    return id
  }

  async addAnswer ({ answer, playerId }) {
    console.info("__playerId__", playerId)
    // const playerId = this.getId()
    const $player = this.scope(`players.${playerId}`)
    // await this.root.subscribe($player)

    $player.push('answers', answer)
  }
}
