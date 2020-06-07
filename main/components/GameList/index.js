import React from 'react'
import { observer, useSession, useQueryDoc, $root, useQuery} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, H4, Span, Div, Avatar } from '@startupjs/ui'
import { GameListItem } from 'components'
import './index.styl'

export default observer(function GameList () {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })
  const [games, $games] = useQuery('games', {
    open: true,

    $or: [
      { opponent: { $exists: false } },
      { opponent: user.id },
      { professor: user.id }
    ]
  })

  if(!games.length) return null

  return pug`
    H4 Games list
    Div.root
      each game in games
        GameListItem(gameId=game.id key=game.id)
  `
})
