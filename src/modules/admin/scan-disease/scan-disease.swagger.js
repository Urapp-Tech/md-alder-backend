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
    body: Type.Object(
      {
        avatar: Type.Any({ isFile: true }),
      },
      { additionalProperties: false }
    ),
  },
  update: {
    description: 'this will update form fields',
    tags: ['ADMIN|FormFields'],
    summary: 'update form fields',
    operationId: 'UpdateFormFields',
    params: Type.Object(
      {
        id: Type.String({ format: 'uuid' }),
      },
      { required: 'id' },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        title: Type.String(),
        type: Type.String(),
      },
      { additionalProperties: false }
    ),
  },
  delete: {
    description: 'this will delete form fields',
    tags: ['ADMIN|FormFields'],
    summary: 'delete form fields',
    operationId: 'DeleteFormFields',
    params: Type.Object(
      {
        id: Type.String({ format: 'uuid' }),
      },
      { required: 'id' },
      { additionalProperties: false }
    ),
  },
  lov: {
    schema: {
      description: `this will list lov form fields`,
      tags: ['ADMIN|FormFields'],
      summary: `form fields with lov`,
      operationId: 'FetchFormFieldsLov',
    },
  },
};

export default swagger;
