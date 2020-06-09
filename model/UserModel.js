import { BaseModel } from 'startupjs/orm'

export default class UserModel extends BaseModel {
  async addUser(data = {}) {
    await this.root.add(this, {
      ...data,
      createdAt: Date.now(),
    })
    return true
  }
}
