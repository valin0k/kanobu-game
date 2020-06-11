import UserModel from './UserModel'
import GameModel from './GameModel'
import PlayerModel from './PlayerModel'

export default function (racer) {
  racer.orm('users', UserModel)
  racer.orm('games', GameModel)
  racer.orm('players', PlayerModel)
}
