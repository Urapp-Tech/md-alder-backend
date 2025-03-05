import s3Config from '#configs/s3.config';
import HTTP_STATUS from '#utilities/http-status';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fastifyPlugin from 'fastify-plugin';

async function s3(fastify, opts) {
  const s3Client = new S3Client(s3Config(opts));

  const handler = async (params) => {
    const uploadResult = await s3Client.send(
      new PutObjectCommand({
        Key: params.Key, // name
        Body: params.Body, // buffer
        'Content-Type': params['Content-Type'], // mimetype
        Bucket: fastify.config.S3_BUCKET,
        ACL: 'public-read',
      })
    );
    if (uploadResult.$metadata.httpStatusCode === HTTP_STATUS.OK) {
      return `https://${fastify.config.S3_BUCKET}.s3.${fastify.config.S3_REGION}.amazonaws.com/${params.Key}`;
    }
    throw new Error('upload failed');
  };
  fastify.decorateRequest('s3Upload', handler);
}

export default fastifyPlugin(s3);
