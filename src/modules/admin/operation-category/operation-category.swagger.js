import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `this will list operation categories`,
      tags: ['ADMIN|Operation Category'],
      summary: `operation categories with pagination`,
      operationId: 'FetchOperationCategories',
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
    description: 'this will create operation category',
    tags: ['ADMIN|Operation Category'],
    summary: 'create operation category',
    operationId: 'CreateOperationCategory',
    body: Type.Object({ name: Type.String() }, { additionalProperties: false }),
  },
  update: {
    description: 'this will update operation category',
    tags: ['ADMIN|Operation Category'],
    summary: 'update operation category',
    operationId: 'UpdateOperationCategory',
    params: Type.Object(
      { operationCategoryId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
    body: Type.Object({ name: Type.String() }, { additionalProperties: false }),
  },
  remove: {
    description: 'this will delete operation category',
    tags: ['ADMIN|Operation Category'],
    summary: 'delete operation category',
    operationId: 'DeleteOperationCategory',
    params: Type.Object(
      { operationCategoryId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
  },
  lov: {
    schema: {
      description: `this will list lov operation category`,
      tags: ['ADMIN|OperationCategoryLov'],
      summary: `operation category with lov`,
      operationId: 'FetchLov',
    },
  },
};

export default swagger;
