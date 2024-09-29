import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'

// TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    // Write your logic here
    const todoId = event.pathParameters.todoId
    const updateTodoInfo = JSON.parse(event.body)
    const userId = getUserId(event)
    await updateTodo(userId, todoId, updateTodoInfo)

    return {
      statusCode: 204,
      body: JSON.stringify({ item: updateTodoInfo })
    }
  })
