const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'todoApplication.db')
let db = null

const intitialserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at 3000')
    })
  } catch (e) {
    console.log(`db error ${e.message}`)
  }
}
intitialserver()

//api 1
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

//api 2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params;
  
  const getdatadb = `SELECT * FROM todo WHERE id=${todoId};`
  const result = await db.get(getdatadb)
  response.send(result)
})

//api 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addquery = `INSERT INTO todo(id, todo, priority, status)
  VALUES('${id}',
  '${todo}',
  '${priority}',
  '${status}');`

  await db.run(addquery)
  response.send('Todo Successfully Added')
})

//api 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params;
  const requestBody = request.body;
  let updated = ''
  switch (true) {
    case requestBody.status !== undefined:
      updated = 'Status'
      break
    case requestBody.priority !== undefined:
      updated = 'Priority'
      break
    case requestBody.todo !== undefined:
      updated = 'Todo'
      break
  }
  const previousdb = `SELECT * FROM todo 
  WHERE id='${todoId}';`
  const dbresult = await db.run(previousdb)
  const {
    todo = dbresult.todo,
    priority = dbresult.priority,
    status = dbresult.status,
  } = request.body

  const updatedquery = `UPDATE todo
  SET 
  todo='${todo}',
  priority='${priority}',
  status='${status}'
  WHERE
  id='${todoId}';`
  await db.run(updatedquery)
  response.send(`${updated} Updated`)
})

//api 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deletequery = `DELETE FROM todo
  WHERE id='${todoId}';`
  await db.run(deletequery)
  response.send('Todo Deleted')
})

module.exports = app
