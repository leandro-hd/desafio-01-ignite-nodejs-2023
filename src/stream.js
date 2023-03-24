import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'

const processCSV = async () => {
  const { pathname } = new URL(import.meta.url)

  const tasksCSV = createReadStream(join(pathname, '..', '..', 'tasks.csv')).pipe(
    parse()
  )

  let count = 0

  for await (const task of tasksCSV) {
    if (count >= 1) {
      await fetch('http://localhost:3333/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: task[0],
          description: task[1]
        })
      })
    }
    
    count += 1
  }
}

processCSV()
