import { Type } from '@sinclair/typebox';

const swagger = {
  get: {
    schema: {
      description: `this will list Vendor Setting`,
      tags: ['ADMIN|Setting'],
      summary: `Setting`,
      operationId: 'FetchVendorSetting',
    },
  },
  update: {
    description: 'this will update setting',
    tags: ['ADMIN|Setting'],
    summary: 'update setting',
    operationId: 'UpdateSetting',
    consumes: ['multipart/form-data'],
    body: Type.Object(
      {
        name: Type.String(),
        address: Type.Optional(Type.String()),
        desc: Type.Optional(Type.String()),
        logo: Type.Optional(Type.Any({ isFile: true })),
        banner: Type.Optional(Type.Any({ isFile: true })),
        media: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),
  },
};

export default swagger;
