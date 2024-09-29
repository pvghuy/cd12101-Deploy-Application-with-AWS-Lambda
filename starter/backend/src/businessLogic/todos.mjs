import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs'
import { createLogger } from '../utils/logger.mjs'
import * as uuid from 'uuid'

const logger = createLogger('TodosAccess')
const attatchmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

export async function getTodosForUser(userId) {
  logger.info('Call get all todos')
  return await todosAccess.getAllTodos(userId)
}

export async function createTodo(newTodo, userId) {
  logger.info('Call create todo')
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const s3AttachUrl = attatchmentUtils.getAttachmentUrl(todoId)
  const newItem = {
    userId,
    todoId,
    createdAt,
    attachmentUrl: s3AttachUrl,
    done: false,
    ...newTodo
  }
  return await todosAccess.createTodo(newItem)
}

export async function updateTodo(userId, todoId, updatedTodo) {
  logger.info('Call update todo')
  return await todosAccess.updateTodo(userId, todoId, updatedTodo)
}

export async function deleteTodo(userId, todoId) {
  logger.info('Call delete todo')
  return await todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId, todoId) {
  logger.info('Call update todo upload url')
  const uploadUrl = todosAccess.updateTodoAttachmentUrl(todoId, userId)
  return uploadUrl
}
