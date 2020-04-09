import inquirer from 'inquirer'

const start = {
  name: 'start',
  type: 'list',
  message: 'What you wanna do?',
  choices: [
    {
      name: 'Start a new game',
      value: 'start',
    },
    {
      name: 'Quit',
      value: 'quit',
    },
  ],
}

const userName = {
  name: 'name',
  type: 'input',
  message: 'Enter your name',
  validate: (value: string) => value.length === 0 ? 'A name is required' : true,
}

const gameName = {
  name: 'gameName',
  type: 'input',
  message: 'New game name',
  validate: (value: string) => value.length === 0 ? 'A name is required' : true,
}

const rows = {
  name: 'rows',
  type: 'list',
  message: 'How many rows?',
  choices: ['5', '10', '20'],
}

const columns = {
  name: 'columns',
  type: 'list',
  message: 'How many columns?',
  choices: ['5', '10', '20'],
}

inquirer.prompt([
  start,
  userName,
  gameName,
  rows,
  columns,
])
.then((response: any) => {
  console.log('>>> response', response)
})
