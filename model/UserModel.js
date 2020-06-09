import { BaseModel } from 'startupjs/orm'

export default class UserModel extends BaseModel {
  async add(data = {}) {
    let id = this.id()

    await this.root.add(this, {
      ...data,
      createdAt: Date.now(),
    })
    return id
  }
}
