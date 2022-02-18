import React from 'react'
import { observer, useSession, useQuery } from 'startupjs'
import { H4, Div } from '@startupjs/ui'
import { GameListItem } from 'components'
import './index.styl'

export default observer(function GameList () {
  const [userId] = useSession('userId')
  const [userPlayers] = useQuery('players', { userId })
  const playerIds = userPlayers.map(player => player.id)

  const [games, $games] = useQuery('games', {
    open: true,
    $or: [
      {
        $nor: [
          { playerIds: { $size: 2 } },
        ],
      },
      { profId: userId },
      { playerIds: { $in: playerIds } }
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
