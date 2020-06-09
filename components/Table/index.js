import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { observer } from 'startupjs'
import { Icon } from '@startupjs/ui'
import './index.styl'

// // @Data Sample
//
// const columns = [{
//   title: 'Name',
//   dataIndex: 'name',
//   key: 'name',
//   render: data => data.age
// }]
//
// let dataSource = [{
//   id: '1',
//   name: 'Mike',
//   age: 32,
//   address: '10 Downing Street'
// }]

export default observer(function ({ dataSource, columns, align, shadow }) {
  const [sort, setSort] = useState({})

  return pug`
    View.table(styleName={ shadow } style={alignSelf: align})
      View.header
        each column in columns
          - var style = {width: column.width, maxWidth: column.width, ...column.headerCellStyle}
          View.headerCell(key=column.key style=style)
            if (column.titleContent)
              =column.titleContent
            else
              if column.onHeaderPress
                View(key=column.key)
                  TouchableOpacity.columnTextIcon(
                    onPress= () => {
                      const sortData = {
                        field: column.key,
                        value: sort.field===column.key ? -sort.value : 1
                      }
                      setSort(sortData)
                      column.onHeaderPress(sortData.field, sortData.value)
                    }
                    styleName=(sort.field===column.key ? 'fieldActive' : '' )
                  )
                    Text= column.title
                    if sort.field === column.key
                      Icon.icon(name=(sort.value===1 ? 'arrow-up' : 'arrow-down') size='xs')
              else
                Text= column.title

      View.body
        each record in dataSource
          View.bodyRow(key=record.id || record._id)
            each column in columns
              - var style = {width: column.width, maxWidth: column.width, ...column.bodyCellStyle}
              View.bodyCell(key=(column.key || column.dataIndex) style=style)
                if column.render
                  = column.render(record)
                else
                  Text= record[column.dataIndex]
  `
})
