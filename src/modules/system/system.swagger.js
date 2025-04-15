import { Type } from '@sinclair/typebox';

const swagger = {
  get: {
    description: 'this will display systemConfig',
    tags: ['ADMIN|System Config'],
    summary: 'System Config',
    operationId: 'systemConfig',
    params: Type.Object(
      {
        domain: Type.String(),
      },
      { additionalProperties: false }
    ),
  },
  defaultTheme: {
    schema: { hide: true },
  },
};

export default swagger;
