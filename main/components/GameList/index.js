import React from 'react'
import { observer, useSession, useQuery } from 'startupjs'
import { H4, Div } from '@startupjs/ui'
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
      { profId: userId },
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
