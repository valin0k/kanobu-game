import TestThing from './TestThingModel'
import UserModel from './UserModel'

export default function (racer) {
  racer.orm('testThings.*', TestThing)
  racer.orm('users', UserModel)
  racer.orm('users.*', UserModel)
}
