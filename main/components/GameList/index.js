import React from 'react'
import {observer, useSession, $root, useQuery, useDoc} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, H4, Span, Div, Avatar } from '@startupjs/ui'
import { GameListItem } from 'components'
import './index.styl'

export default observer(function GameList () {
  const [userId] = useSession('userId')
  const [user] = useDoc('users', userId)
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
    Div.root
      H4 Games list
      Div.games
        each game in games
          GameListItem(gameId=game.id key=game.id)
  `
})
