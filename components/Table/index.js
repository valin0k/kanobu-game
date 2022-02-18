import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { observer } from 'startupjs'
import { Icon } from '@startupjs/ui'
import './index.styl'

export default observer(function ({ dataSource, columns, align, shadow }) {
  return pug`
    View.table(styleName={ shadow } style={alignSelf: align})
      View.header
        each column in columns
          - const style = {width: column.width, maxWidth: column.width, ...column.headerCellStyle}
          View.headerCell(key=column.key style=style)
            if (column.titleContent)
              =column.titleContent
            else
              if column.onHeaderPress
                View(key=column.key)
                  TouchableOpacity.columnTextIcon(
                    onPress= () => { }
                  )
                    Text= column.title
              else
                Text= column.title

      View.body
        each record in dataSource
          View.bodyRow(key=record.id || record._id)
            each column, i in columns
              - const style = {width: column.width, maxWidth: column.width, ...column.bodyCellStyle}
              View.bodyCell(key=(column.key || column.dataIndex) style=style)
                Text= record[column.dataIndex]
  `
})
