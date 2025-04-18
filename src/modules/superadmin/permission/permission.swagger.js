import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `This will list Permissions`,
      tags: ['ADMIN|Permissions'],
      summary: `Permissions with pagination`,
      operationId: 'FetchPermissions',
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
    description: 'this will create permission',
    tags: ['ADMIN|Permission'],
    summary: 'create permission',
    operationId: 'CreatePermission',
    body: Type.Object(
      {
        name: Type.String(),
        desc: Type.Optional(Type.String()),
        permissionType: Type.String(),
        data: Type.Optional(Type.Array()),
      },
      { additionalProperties: false }
    ),
  },
  edit: {
    schema: {
      description: 'this will edit',
      tags: ['superAdmin|Permission'],
      summary: 'edit',
      params: Type.Object(
        {
          id: Type.String({ format: 'uuid' }),
        },
        { required: 'id' },
        { additionalProperties: false }
      ),
    },
  },
  childList: {
    schema: {
      description: 'this will child list',
      tags: ['superAdmin|Permission'],
      summary: 'child list',
      querystring: Type.Object(
        {
          page: Type.Integer({ default: 0, minimum: 0 }),
          size: Type.Integer({ default: 10, minimum: 10 }),
          search: Type.Optional(Type.String()),
        },
        { additionalProperties: false }
      ),
      params: Type.Object(
        {
          pid: Type.String({ format: 'uuid' }),
        },
        { required: 'pid' },
        { additionalProperties: false }
      ),
    },
  },

  update: {
    description: 'this will update permissions',
    tags: ['ADMIN|Permissions'],
    summary: 'update permissions',
    operationId: 'UpdatePermissions',
    params: Type.Object(
      {
        pid: Type.String({ format: 'uuid' }),
      },
      { required: 'pid' },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        name: Type.String(),
        desc: Type.Optional(Type.String()),
        permissionType: Type.String(),
        data: Type.Optional(Type.Array()),
      },
      { additionalProperties: false }
    ),
  },
  updateStatus: {
    schema: {
      description: `this will status update permission`,
      tags: ['superAdmin|Permission'],
      summary: `status update permission`,
      params: Type.Object(
        {
          id: Type.String({ format: 'uuid' }),
        },
        { required: 'id' },
        { additionalProperties: false }
      ),
      body: Type.Object(
        {
          isActive: Type.Boolean(),
        },
        { additionalProperties: false }
      ),
    },
  },
  delete: {
    description: 'this will delete user',
    tags: ['ADMIN|User'],
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
