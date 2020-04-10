import fetch from 'node-fetch'
import inquirer, { Answers } from 'inquirer'
import { promptConfig } from './promptConfig'

const API_URL = process.env.API_URL || 'http://localhost:8080'

type ColumnsConfig = {
  [key: number]: string;
}

type Grid = ColumnsConfig[]

function drawGrid ({ rows, columns }: { rows: string; columns: string; }) {
  let grid: Grid = []
  let columnsConfig: ColumnsConfig = {}

  for (let i = 0; i < Number(columns); i++) {
    columnsConfig[i] = 'X'
  }

  for (let j = 0; j < Number(rows); j++) {
    grid.push(columnsConfig)
  }

  grid.push(columnsConfig)

  console.table(grid)
}

(async () => {
  const {
    gameName,
    rows,
    columns,
    mines,
    userName,
  }: Answers = await inquirer.prompt([ ...promptConfig ])

  try {
    const game = await fetch(`${API_URL}/games`, {
      method: 'post',
      body: JSON.stringify({
        name: gameName,
        rows: Number(rows),
        cols: Number(columns),
        mines: Number(mines),
        username: userName,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    console.log('>>> game response', game)

    const jsonGame = await game.json()

    console.log('>>> created game', jsonGame)
  } catch (error) {
    console.error('>>> error', error)
  }
})()
