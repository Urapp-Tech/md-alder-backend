import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `this will list operation category items`,
      tags: ['ADMIN|Operation Category Item'],
      summary: `operation category items with pagination`,
      operationId: 'FetchOperationCategoryItems',
      querystring: Type.Object(
        {
          page: Type.Integer({ default: 0, minimum: 0 }),
          size: Type.Integer({ default: 10, minimum: 10 }),
          search: Type.Optional(Type.String()),
          operationCategory: Type.String({ format: 'uuid' }),
        },
        { additionalProperties: false }
      ),
    },
  },
  create: {
    description: 'this will create operation category item',
    tags: ['ADMIN|Operation Category Item'],
    summary: 'create operation category item',
    operationId: 'CreateOperationCategoryItem',
    body: Type.Object(
      {
        name: Type.String(),
        operationCategory: Type.String({ format: 'uuid' }),
      },
      { additionalProperties: false }
    ),
  },
  update: {
    description: 'this will update operation category item',
    tags: ['ADMIN|Operation Category Item'],
    summary: 'update operation category item',
    operationId: 'UpdateOperationCategoryItem',
    params: Type.Object(
      { operationCategoryItemId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
    body: Type.Object({ name: Type.String() }, { additionalProperties: false }),
  },
  remove: {
    description: 'this will delete operation category item',
    tags: ['ADMIN|Operation Category Item'],
    summary: 'delete operation category item',
    operationId: 'DeleteOperationCategoryItem',
    params: Type.Object(
      { operationCategoryItemId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
  },
  lov: {
    schema: {
      description: `this will list lov operation category item`,
      tags: ['ADMIN|OperationCategoryItemLov'],
      summary: `operation category item with lov`,
      operationId: 'FetchLov',
    },
  },
};

export default swagger;
