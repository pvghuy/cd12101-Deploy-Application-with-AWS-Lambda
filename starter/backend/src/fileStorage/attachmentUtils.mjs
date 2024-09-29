export class AttachmentUtils {
  constructor() {
    this.bucketName = process.env.ATTACHMENT_S3_BUCKET
  }

  getAttachmentUrl(todoId) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }
}
