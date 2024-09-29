import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { deleteTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'

// TODO: Remove a TODO item by id
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
    const userId = getUserId(event)
    await deleteTodo(userId, todoId)

    return {
      statusCode: 204,
      body: 'successfully deleted'
    }
  })
