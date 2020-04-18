import fetch, { Response } from 'node-fetch'
import inquirer, { Answers } from 'inquirer'
import { promptConfig } from './promptConfig'
import {
  DUPLICATE_ENTRY_ERROR,
  ClickResponse,
  ColumnsConfig,
  CreateGameResponse,
  CreateUserResponse,
  DrewGrid,
  ErrorResponse,
  GameConfig,
  Grid,
} from './types'

const API_URL = process.env.API_URL || 'http://localhost:8080'

/**
 * Draws a grid based on the back end response
 * f - flagged cell
 * ? - marked cell
 * x - cell not clicked
 * blank - cell clicked
 */
function drawGrid (data: Grid) {
  const grid: DrewGrid = []

  for (let i = 0; i < data.length; i++) {
    const columnsConfig: ColumnsConfig = {}

    for (let j = 0; j < data[i].length; j++) {
      const cell = data[i][j]

      if (cell.flagged) {
        columnsConfig[j] = 'f'
      } else if (cell.marked) {
        columnsConfig[j] = '?'
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

/**
 * 1 - prompt to ask for user name
 * 2 - execute api call
 * 3 - handle error | return created user
 */
async function createUser (): Promise<string | undefined> {
  try {
    const { userName }: Answers = await inquirer.prompt([ promptConfig.userName ])
    const createUserResponse = await fetch(`${API_URL}/users`, {
      method: 'post',
      body: JSON.stringify({
        username: userName,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const { result, type }: CreateUserResponse & ErrorResponse = await createUserResponse.json()

    // no result and type means error
    if (!result && type) {
      throw new Error(type)
    }

    return result.username
  } catch (error) {
    if (error.message === DUPLICATE_ENTRY_ERROR) {
      await createUser()
    } else {
      throw error
    }
  }
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
  const { result } = await game.json()
  const startedGame = await fetch(
    `${API_URL}/games/${result.name}/users/${result.username}`,
    {
      method: 'post',
    }
  )

  return startedGame.json()
}

/**
 * 1 - prompt to ask for cell coordinates
 * 2 - execute api call
 * 3 - draw updated grid
 */
async function clickCell(
  gameName: string,
  userName: string,
): Promise<undefined | boolean> {
  const { click, clickType }: Answers = await inquirer.prompt([ promptConfig.click, promptConfig.clickType ])
  const [column, row] = click.split(',')

  const clickResponse: Response = await fetch(`${API_URL}/games/${gameName}/users/${userName}/click`, {
    method: 'post',
    body: JSON.stringify({
      row: Number(row),
      col: Number(column),
      click_type: clickType,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
  const clickResponseJson: ClickResponse = await clickResponse.json()

  if (!clickResponseJson.success) {
    console.log('>>>', clickResponse)
    throw new Error('Can not click cell')
  }

  if (!clickResponseJson.result.game && clickResponseJson.result.message) {
    return Promise.resolve(true)
  }

  // @ts-ignore ignoring since it's unreachable if game is not defined
  drawGrid(clickResponseJson.result.game?.grid)
}

(async () => {
  let gameLost: undefined | boolean = false

  try {
    const userName = await createUser()

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
      // @ts-ignore ignoring this since the createGame definition says it returns undefined which is not possible
      username: userName,
    })

    if (!createGameResponse.success) {
      throw new Error('Can not create game')
    }

    const { result } = createGameResponse

    drawInitialGrid(result.rows, result.cols)

    while (!gameLost) {
      gameLost = await clickCell(result.name, result.username)
    }

    process.exit(0)
  } catch (error) {
    console.log('>>>', error)

    process.exit(1)
  }
})()
