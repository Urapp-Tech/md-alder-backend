import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `this will list Cabins`,
      tags: ['ADMIN|Cabin'],
      summary: `Cabins with pagination`,
      operationId: 'FetchCabin',
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
    description: 'this will create cabin',
    tags: ['ADMIN|Cabin'],
    summary: 'create cabin',
    operationId: 'CreateCabin',
    body: Type.Object(
      { cabinNumber: Type.String() },
      { additionalProperties: false }
    ),
  },
  update: {
    description: 'this will update employee',
    tags: ['ADMIN|Employee'],
    summary: 'update employee',
    operationId: 'UpdateEmployee',
    params: Type.Object(
      { cabinId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
    body: Type.Object(
      { cabinNumber: Type.String() },
      { additionalProperties: false }
    ),
  },
  delete: {
    description: 'this will delete cabin',
    tags: ['ADMIN|Cabin'],
    summary: 'delete cabin',
    operationId: 'DeleteCabin',
    params: Type.Object(
      { cabinId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false }
    ),
  },
  lov: {
    schema: {
      description: `this will list lov Cabins`,
      tags: ['ADMIN|Cabin'],
      summary: `Cabin with lov`,
      operationId: 'FetchCabinLov',
    },
  },
  assign: {
    description: 'this will assign cabin to employee',
    tags: ['ADMIN|Cabin'],
    summary: 'assign cabin to employee',
    operationId: 'AssignCabinToEmployee',
    body: Type.Object(
      {
        cabin: Type.String({ format: 'uuid' }),
        employee: Type.String({ format: 'uuid' }),
      },
      { additionalProperties: false }
    ),
  },
  scanner: {
    description: 'this will scan cabin of employee',
    tags: ['ADMIN|Cabin'],
    summary: 'scan cabin of employee',
    operationId: 'ScanCabinOfEmployee',
    body: Type.Object(
      {
        tenant: Type.String({ format: 'uuid' }),
        cabin: Type.String({ format: 'uuid' }),
        identifier: Type.Boolean(),
      },
      { additionalProperties: false }
    ),
  },
  history: {
    description: 'This will show all cabin history of employee',
    tags: ['ADMIN|Cabin'],
    summary: 'Cabin history of employee',
    operationId: 'CabinHistoryOfEmployee',
    querystring: Type.Object({
      cabin: Type.String({ description: 'The cabin UUID', format: 'uuid' }),
      employee: Type.String({
        description: 'The employee UUID',
        format: 'uuid',
      }),
      startDate: Type.String({
        description: 'Start date for the cabin history range',
        format: 'date',
      }),
      endDate: Type.String({
        description: 'End date for the cabin history range',
        format: 'uuid',
      }),
      page: Type.Integer({ default: 0, minimum: 0 }),
      size: Type.Integer({ default: 30, minimum: 30 }),
    }),
  },
  cabinHistory: {
    description: 'This will show all cabin history',
    tags: ['ADMIN|Cabin'],
    summary: 'Cabin history',
    operationId: 'CabinHistory',
    querystring: Type.Object({
      cabin: Type.String({ description: 'The cabin UUID', format: 'uuid' }),
      employee: Type.String({
        description: 'The employee UUID',
        format: 'uuid',
      }),
      startDate: Type.String({
        description: 'Start date for the cabin history range',
        format: 'date',
      }),
      endDate: Type.String({
        description: 'End date for the cabin history range',
        format: 'uuid',
      }),
      page: Type.Integer({ default: 0, minimum: 0 }),
      size: Type.Integer({ default: 30, minimum: 30 }),
    }),
  },
};

export default swagger;
