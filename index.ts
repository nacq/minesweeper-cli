import fetch from 'node-fetch'
import inquirer, { Answers } from 'inquirer'
import { promptConfig } from './promptConfig'
import {
  ColumnsConfig,
  CreateGameResponse,
  CreateUserResponse,
  GameConfig,
  Grid,
} from './types'

const API_URL = process.env.API_URL || 'http://localhost:8080'

function drawGrid ({ rows, columns }: { rows: number; columns: number; }) {
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

async function createUser (gameName: string): Promise<CreateUserResponse> {
  const user = await fetch(`${API_URL}/users`, {
    method: 'post',
    body: JSON.stringify({
      username: gameName,
    })
  })

  return user.json()
}

async function createGame ({
  name,
  rows,
  cols,
  mines,
  username,
}: GameConfig): Promise<CreateGameResponse> {
  const game = await fetch(`${API_URL}/games`, {
    method: 'post',
    body: JSON.stringify({
      name,
      rows,
      cols,
      mines,
      username,
    }),
    headers: { 'Content-Type': 'application/json' },
  })

  return game.json()
}

(async () => {
  const { userName }: Answers = await inquirer.prompt([ promptConfig.userName ])

  try {
    const createUserResponse = await createUser(userName)

    if (!createUserResponse.success) {
      console.log('>>>', createUserResponse)
      throw new Error('Can not create user')
    }

    const { gameName, rows, columns, mines }: Answers = await inquirer.prompt([
      promptConfig.start,
      promptConfig.gameName,
      promptConfig.rows,
      promptConfig.columns,
      promptConfig.mines,
    ])

    const createGameResponse: CreateGameResponse = await createGame({
      name: gameName,
      rows: Number(rows),
      cols: Number(columns),
      mines: Number(mines),
      username: createUserResponse.result.username,
    })

    if (!createGameResponse.success) {
      console.log('>>>', createGameResponse)
      throw new Error('Can not create game')
    }

    drawGrid({
      rows: createGameResponse.result.rows,
      columns: createGameResponse.result.cols,
    })

  } catch (error) {
    console.log('>>>', error)
  }
})()
