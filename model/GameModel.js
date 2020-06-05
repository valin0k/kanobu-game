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

  // updateS
}
