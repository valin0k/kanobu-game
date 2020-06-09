import React from 'react'
import { observer, useSession, useQueryDoc, $root, useQuery} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, H4, Span, Div, Avatar } from '@startupjs/ui'
import { GameResult } from 'components'
import './index.styl'

export default observer(function ClosedGameList () {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })
  const [games, $games] = useQuery('games', {
    open: false,

    $or: [
      { opponent: { $exists: false } },
      { opponent: user.id },
      { professor: user.id }
    ]
  })

  if(!games.length) return null

  return pug`
    Div.root
      H4  Closed games list
      Div.games
        each game in games
          GameResult(gameId=game.id key=game.id)
  `
})
