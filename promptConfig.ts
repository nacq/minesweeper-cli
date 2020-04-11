export const promptConfig = {
  start: {
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
  },
  userName: {
    name: 'userName',
    type: 'input',
    message: 'Enter your name',
    validate: (value: string) => value.length === 0 ? 'A name is required' : true,
  },
  gameName: {
    name: 'gameName',
    type: 'input',
    message: 'New game name',
    validate: (value: string) => value.length === 0 ? 'A name is required' : true,
  },
  rows: {
    name: 'rows',
    type: 'list',
    message: 'How many rows?',
    choices: ['5', '10', '20'],
  },
  columns: {
    name: 'columns',
    type: 'list',
    message: 'How many columns?',
    choices: ['5', '10', '20'],
  },
  mines: {
    name: 'mines',
    type: 'list',
    message: 'How many mines?',
    choices: ['5', '10', '20'],
  }
}
