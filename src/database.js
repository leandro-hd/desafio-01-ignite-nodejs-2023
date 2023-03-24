import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data)
      }).catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()
  }

  select(table, filter) {
    let data = this.#database[table] ?? {}

    if (filter) {
      data = data.filter(task => {
        if (JSON.stringify(task).toLowerCase().includes(filter.toLowerCase())) {
          return task
        }
      })
    }

    return data
  }

  update(table, id, data) {
    const taskIndex = this.#database[table].findIndex(task => task.id === id)

    if (taskIndex > -1) {
      this.#database[table][taskIndex] = data
      this.#persist()
    }
  }

  delete(table, id) {
    const taskIndex = this.#database[table].findIndex(task => task.id === id)

    if (taskIndex > -1) {
      this.#database[table].splice(taskIndex, 1)
      this.#persist()
    }
  }
}
