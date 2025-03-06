import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `this will list Employees`,
      tags: ['ADMIN|Employee'],
      summary: `Employees with pagination`,
      operationId: 'FetchEmployee',
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
    description: 'this will create patient',
    tags: ['ADMIN|Patient'],
    summary: 'create patient',
    operationId: 'CreatePatient',
    consumes: ['multipart/form-data'],
    body: Type.Object(
      {
        name: Type.String(),
        email: Type.Optional(
          Type.Union([Type.String({ format: 'email' }), Type.Literal('')])
        ),
        phone: Type.String(),
        gender: Type.String(),
        age: Type.Optional(Type.String()),
        address: Type.Optional(Type.String()),
        occupation: Type.Optional(Type.String()),
        avatar: Type.Optional(Type.Any({ isFile: true })),
      },
      { additionalProperties: false }
    ),
  },
  update: {
    description: 'this will update employee',
    tags: ['ADMIN|Employee'],
    summary: 'update employee',
    operationId: 'UpdateEmployee',
    consumes: ['multipart/form-data'],
    params: Type.Object(
      {
        empId: Type.String({ format: 'uuid' }),
      },
      { required: 'empId' },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        name: Type.String(),
        email: Type.Optional(
          Type.Union([Type.String({ format: 'email' }), Type.Literal('')])
        ),
        phone: Type.String(),
        cardNumber: Type.Optional(Type.String()),
        address: Type.Optional(Type.String()),
        avatar: Type.Optional(Type.Any({ isFile: true })),
      },
      { additionalProperties: false }
    ),
  },
  delete: {
    description: 'this will delete employee',
    tags: ['ADMIN|Employee'],
    summary: 'delete employee',
    operationId: 'DeleteEmployee',
    params: Type.Object(
      {
        empId: Type.String({ format: 'uuid' }),
      },
      { required: 'empId' },
      { additionalProperties: false }
    ),
  },
  lov: {
    schema: {
      description: `this will list lov Employees`,
      tags: ['ADMIN|Employee'],
      summary: `Employees with lov`,
      operationId: 'FetchEmployeeLov',
    },
  },
};

export default swagger;
