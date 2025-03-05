import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `this will list operation Report`,
      tags: ['ADMIN|Operation Report'],
      summary: `operation Report with pagination`,
      operationId: 'FetchOperationReport',
      querystring: Type.Object({
        employee: Type.String({
          format: 'uuid',
        }),
        startDate: Type.String({
          format: 'date',
        }),
        endDate: Type.String({
          format: 'uuid',
        }),
        page: Type.Integer({ default: 0, minimum: 0 }),
        size: Type.Integer({ default: 30, minimum: 30 }),
      }),
    },
  },
  create: {
    description: 'this will create operation report',
    tags: ['ADMIN|Operation Report'],
    summary: 'create operation report',
    operationId: 'CreateOperationReport',
    body: Type.Object(
      {
        employee: Type.String({ format: 'uuid' }),
        operationCategory: Type.String({ format: 'uuid' }),
        operationCategoryItem: Type.String({ format: 'uuid' }),
        bno: Type.String(),
        qty: Type.String(),
      },
      { additionalProperties: false }
    ),
  },
  update: {
    description: 'this will update operation report',
    tags: ['ADMIN|Operation Report'],
    summary: 'update operation report',
    operationId: 'UpdateOperationReport',
    params: Type.Object(
      { operationCategoryId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
    body: Type.Object({ name: Type.String() }, { additionalProperties: false }),
  },
  remove: {
    description: 'this will delete operation report',
    tags: ['ADMIN|Operation Report'],
    summary: 'delete operation report',
    operationId: 'DeleteOperationReport',
    params: Type.Object(
      { operationCategoryId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
  },
};

export default swagger;
