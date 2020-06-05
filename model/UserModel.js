import { BaseModel } from 'startupjs/orm'

export default class UserModel extends BaseModel {
  async add(data = {}) {
    let id = this.id()
    console.info("__id__", id)
    await this.root.addAsync(this, {
      ...data,
      createdAt: Date.now(),
      // id
    })
    return id
  }
}
