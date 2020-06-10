import React from 'react'
import {observer, useSession, $root, useQuery} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, H4, Span, Div, Avatar } from '@startupjs/ui'
import { GameListItem } from 'components'
import './index.styl'

export default observer(function GameList () {
  const [userId] = useSession('userId')
  const [games, $games] = useQuery('games', {
    open: true,
    $or: [
      {
        $nor: [
          { userIds: { $size: 2 } },
        ],
      },
      { professor: userId },
      {userIds: {$in: [userId]}}
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
