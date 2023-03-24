import http from 'node:http'
import { randomUUID } from 'node:crypto'

import { Database } from './database.js'
import { json } from './middlewares/json.js'

const database = new Database()

const server = http.createServer(async (req, res) => {
  await json(req, res)

  const { method, url } = req

  if (method === 'POST' && url === '/tasks') {
    const { title, description } = req.body

    if (!title || !description) {
      return res.writeHead(400).end(JSON.stringify({
        message: 'Os campos title e description são obrigatórios'
      }))
    }

    database.insert('tasks', {
      id: randomUUID(),
      title,
      description,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return res.writeHead(201).end()
  }

  if (method === 'GET' && url.split('?')[0] === '/tasks') {
    const filter = req.url?.split('q=')[1]

    const tasks = database.select('tasks', filter)

    return res.writeHead(200).end(JSON.stringify(tasks))
  }

  if (method === 'PUT' && url.split('/').length === 3 && url.split('/')[1] === 'tasks') {
    const { title, description } = req.body

    if (!title && !description) {
      return res.writeHead(400).end(JSON.stringify({
        message: 'Os campos title e description são obrigatórios'
      }))
    }

    const taskId = url.split('/')[2]

    const task = database.select('tasks', taskId)

    if (task.length === 0 || task[0].id !== taskId) {
      return res.writeHead(400).end(JSON.stringify({
        message: 'Nenhuma task foi encontrada com o id informado'
      }))
    }

    database.update('tasks', taskId, {
      id: task[0].id,
      title: title ?? task[0].title,
      description: description ?? task[0].description,
      completedAt: task[0].completedAt,
      createdAt: task[0].createdAt,
      updatedAt: new Date()
    })

    return res.writeHead(204).end()
  }

  if (method === 'PATCH' && url.split('/').length === 4 && url.split('/')[1] === 'tasks' && url.split('/')[3] === 'iscomplete') {
    const taskId = url.split('/')[2]

    const task = database.select('tasks', taskId)

    if (task.length === 0 || task[0].id !== taskId) {
      return res.writeHead(400).end(JSON.stringify({
        message: 'Nenhuma task foi encontrada com o id informado'
      }))
    }

    database.update('tasks', taskId, {
      ...task[0],
      isComplete: !task[0].isComplete,
      completedAt: !task[0].isComplete ? new Date() : null,
      updatedAt: new Date()
    })

    return res.writeHead(204).end()
  }

  if (method === 'DELETE' && url.split('/').length === 3 && url.split('/')[1] === 'tasks') {
    const taskId = url.split('/')[2]

    const task = database.select('tasks', taskId)

    if (task.length === 0 || task[0].id !== taskId) {
      return res.writeHead(400).end(JSON.stringify({
        message: 'Nenhuma task foi encontrada com o id informado'
      }))
    }

    database.delete('tasks', taskId)

    return res.writeHead(204).end()
  }

  return res.writeHead(404).end()
})

server.listen(3333)

console.log('Server is running')
