import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `this will list`,
      tags: ['ADMIN|FormFields'],
      summary: `form fields with pagination`,
      operationId: 'FetchFormFields',
      querystring: Type.Object(
        {
          page: Type.Integer({ default: 0, minimum: 0 }),
          size: Type.Integer({ default: 10, minimum: 10 }),
          search: Type.Optional(Type.String()),
        },
        { additionalProperties: false }
      ),
    },
  },
  create: {
    description: 'this will create',
    tags: ['ADMIN|ScanDisease'],
    summary: 'create',
    operationId: 'Create',
    consumes: ['multipart/form-data'],
    body: Type.Object(
      {
        avatar: Type.Any({ isFile: true }),
        results: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),
  },
};

export default swagger;
