import UserModel from './UserModel'
import GameModel from './GameModel'

export default function (racer) {
  racer.orm('users', UserModel)
  racer.orm('games', GameModel)
}
