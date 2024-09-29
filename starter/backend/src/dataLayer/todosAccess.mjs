import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as AWS from 'aws-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodoAccess')

// const dynamo = new AWS.DynamoDB();

export class TodosAccess {
  // constructor(dynamoDbXRay = AWSXRay.captureAWSv3Client(new DynamoDB())) {
  //   this.dynamoDbClient = DynamoDBDocument.from(dynamoDbXRay)
  //   this.todosTable = process.env.TODOS_TABLE
  // }
  constructor(
    dynamoDbXRay = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE,
    s3Client = new S3Client()
  ) {
    // this.docClient = new AWS.DynamoDB.DocumentClient()
    // this.todosTable = process.env.TODOS_TABLE
    this.dynamoDbClient = DynamoDBDocument.from(dynamoDbXRay)
    this.todosTable = todosTable
    this.s3Client = s3Client
  }

  async getAllTodos(userId) {
    logger.info('Call get all todos')
    console.log('docClient', this.dynamoDbClient)
    console.log('userID', userId)

    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      IndexName: process.env.TODOS_CREATED_AT_INDEX,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })

    return result.Items
  }

  async createTodo(item) {
    logger.info('Call create todo')
    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: item
    })

    return item
  }

  async updateTodo(userId, todoId, todoUpdate) {
    logger.info('Call update todo')
    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
      ReturnValues: 'UPDATED_NEW'
    })

    return todoUpdate
  }

  async deleteTodo(userId, todoId) {
    logger.info('Call delete todo')
    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    })

    return 'deleted ' + todoId
  }

  async updateTodoAttachmentUrl(todoId, userId) {
    logger.info('Call update todo upload url')
    const command = new PutObjectCommand({
      Bucket: process.env.ATTACHMENT_S3_BUCKET,
      Key: todoId
    })
    const attachmentUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: process.env.SIGNED_URL_EXPIRATION
    })

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl.split('?')[0]
      },
      ReturnValues: 'UPDATED_NEW'
    })

    return attachmentUrl
  }
}
