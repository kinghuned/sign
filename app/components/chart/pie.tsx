import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart'
import { User } from '@prisma/client'
import * as React from 'react'

export interface PieChartCustomProps {
  userList: User[]
}

export default function PieChartCustom({ userList }: PieChartCustomProps) {
  return (
    <PieChart
      series={[
        {
          arcLabel: item => `${item.value}`,
          data: [
            { id: 0, value: userList.filter(user => user.role === 'user').length, label: 'User' },
            { id: 1, value: userList.filter(user => user.role === 'admin').length, label: 'Admin' }
          ]
        }
      ]}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fill: 'white',
          fontWeight: 'bold'
        }
      }}
      height={250}
    />
  )
}
