import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `This will list Roles`,
      tags: ['ADMIN|Roles'],
      summary: `Roles with pagination`,
      operationId: 'FetchRoles',
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
    description: 'this will create role',
    tags: ['ADMIN|Role'],
    summary: 'create role',
    operationId: 'CreateRole',
    body: Type.Object(
      {
        name: Type.String(),
        desc: Type.Optional(Type.String()),
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
    description: 'this will update role permissions',
    tags: ['ADMIN|Role'],
    summary: 'update role permissions',
    operationId: 'UpdateRole',
    params: Type.Object(
      {
        roleId: Type.String({ format: 'uuid' }),
      },
      { required: 'roleId' },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        name: Type.String(),
        desc: Type.Optional(Type.String()),
        data: Type.Optional(Type.Array()),
      },
      { additionalProperties: false }
    ),
  },
  updateStatus: {
    schema: {
      description: `this will status update status`,
      tags: ['superAdmin|Role'],
      summary: `status update role`,
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
  getPermissions: {
    schema: { hide: true },
  },
  permission: {
    schema: {
      description: 'this will Role',
      tags: ['superAdmin|Role'],
      summary: 'Role',
      params: Type.Object(
        {
          roleId: Type.String({ format: 'uuid' }),
        },
        { required: 'roleId' },
        { additionalProperties: false }
      ),
    },
  },
  lov: {
    schema: { hide: true },
  },
};

export default swagger;
