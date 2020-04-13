import fetch, { Response } from 'node-fetch'
import inquirer, { Answers } from 'inquirer'
import { promptConfig } from './promptConfig'
import {
  ClickResponse,
  ColumnsConfig,
  CreateGameResponse,
  CreateUserResponse,
  DrewGrid,
  GameConfig,
  Grid,
} from './types'

const API_URL = process.env.API_URL || 'http://localhost:8080'

/**
 * Draws a grid based on the back end response
 * f - flagged cell
 * ? - marked cell
 * m - mine
 * x - cell not clicked
 * blank - cell clicked
 */
function drawGrid (data: Grid) {
  let grid: DrewGrid = []
  let columnsConfig: ColumnsConfig = {}

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const cell = data[i][j]

      if (cell.clicked && cell.flagged) {
        columnsConfig[j] = 'f'
      } else if (cell.clicked && cell.marked) {
        columnsConfig[j] = '?'
      } else if (cell.clicked && cell.mine) {
        columnsConfig[j] = 'm'
      } else if (cell.clicked) {
        columnsConfig[j] = ' '
      } else {
        columnsConfig[j] = 'x'
      }
    }
    grid.push(columnsConfig)
  }

  console.table(grid)
}

// draws the initial grid based on the given number of columns and rows
function drawInitialGrid (rows: number, columns: number) {
  let grid: { [key: number]: string }[] = [];
  let columnsConfig: ColumnsConfig = {}

  for (let i = 0; i < Number(columns); i++) {
    columnsConfig[i] = 'x'
  }

  for (let j = 0; j < Number(rows); j++) {
    grid.push(columnsConfig)
  }

  console.table(grid)
}

async function createUser (gameName: string): Promise<CreateUserResponse> {
  const user = await fetch(`${API_URL}/users`, {
    method: 'post',
    body: JSON.stringify({
      username: gameName,
    }),
    headers: { 'Content-Type': 'application/json' },
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

/**
 * 1 - prompt to ask for cell coordinates
 * 2 - execute api call
 * 3 - draw updated grid
 */
async function clickCell(
  gameName: string,
  userName: string,
) {
  const { click, clickType }: Answers = await inquirer.prompt([ promptConfig.click, promptConfig.clickType ])
  const [column, row] = click.split(',')

  const clickResponse: Response = await fetch(`${API_URL}/games/${gameName}/users/${userName}`, {
    method: 'post',
    body: JSON.stringify({
      // back end does not start from 0
      row: Number(row) + 1,
      col: Number(column) + 1,
      click_type: clickType,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
  const clickResponseJson: ClickResponse = await clickResponse.json()

  if (!clickResponseJson.success) {
    console.log('>>>', clickResponse)
    throw new Error('Can not click cell')
  }

  drawGrid(clickResponseJson.result.grid)
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

    const { success, result }: CreateGameResponse = await createGame({
      name: gameName,
      rows: Number(rows),
      cols: Number(columns),
      mines: Number(mines),
      username: createUserResponse.result.username,
    })

    if (!success) {
      throw new Error('Can not create game')
    }

    drawInitialGrid(result.rows, result.cols)

    await clickCell(result.name, result.username)

  } catch (error) {
    console.log('>>>', error)

    process.exit(1)
  }
})()
