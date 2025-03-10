import { Type } from '@sinclair/typebox';

const swagger = {
  login: {
    description: 'this will sign in app user',
    tags: ['APP|User'],
    summary: 'sign in app user',
    operationId: 'userSignIn',
    body: Type.Object(
      {
        identifier: Type.String(),
        password: Type.String({ minLength: 8 }),
      },
      { additionalProperties: false }
    ),
  },
  logout: {
    description: 'this will sign out app user',
    tags: ['APP|User'],
    summary: 'sign out app user',
    operationId: 'userSignOut',
    body: Type.Object(
      {
        invalidateAllTokens: Type.Boolean(),
      },
      { additionalProperties: false }
    ),
  },
  list: {
    schema: {
      description: `This will list APP Users`,
      tags: ['APP|User'],
      summary: `APP Users with pagination`,
      operationId: 'FetchUsers',
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
    description: 'this will create user',
    tags: ['APP|User'],
    summary: 'create user',
    operationId: 'CreateUser',
    body: Type.Object(
      {
        firstName: Type.String(),
        lastName: Type.String(),
        email: Type.String({ format: 'email' }),
        password: Type.String({
          pattern: '^[a-zA-Z0-9]{3,30}$',
        }),
        phone: Type.String(),
        address: Type.Optional(Type.String()),
        userType: Type.String(),
      },
      { additionalProperties: false }
    ),
  },
  update: {
    description: 'this will update user',
    tags: ['APP|User'],
    summary: 'update user',
    operationId: 'UpdateUser',
    params: Type.Object(
      {
        userId: Type.String({ format: 'uuid' }),
      },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        firstName: Type.String(),
        lastName: Type.String(),
        email: Type.String({ format: 'email' }),
        phone: Type.String(),
        address: Type.Optional(Type.String()),
      },
      {
        additionalProperties: false,
      }
    ),
  },
  delete: {
    description: 'this will delete user',
    tags: ['APP|User'],
    summary: 'delete user',
    operationId: 'DeleteUser',
    params: Type.Object(
      {
        userId: Type.String({ format: 'uuid' }),
      },
      { required: 'userId' },
      { additionalProperties: false }
    ),
  },
};

export default swagger;
