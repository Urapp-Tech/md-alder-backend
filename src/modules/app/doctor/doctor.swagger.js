import { Type } from '@sinclair/typebox';

const swagger = {
  getOtp: {
    description: 'this will send otp to email',
    tags: ['APP|Doctor'],
    summary: 'send otp to email',
    operationId: 'DoctorGetOtp',
    params: Type.Object(
      {
        tenant: Type.String({ format: 'uuid' }),
      },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        email: Type.String(),
      },
      { additionalProperties: false }
    ),
  },
  login: {
    description: 'this will sign in app doctor',
    tags: ['APP|Doctor'],
    summary: 'sign in app doctor',
    operationId: 'DoctorSignIn',
    body: Type.Object(
      {
        identifier: Type.String(),
        password: Type.String({ minLength: 8 }),
      },
      { additionalProperties: false }
    ),
  },
  logout: {
    description: 'this will sign out app doctor',
    tags: ['APP|Doctor'],
    summary: 'sign out app doctor',
    operationId: 'DoctorSignOut',
    body: Type.Object(
      {
        invalidateAllTokens: Type.Boolean(),
      },
      { additionalProperties: false }
    ),
  },
  list: {
    schema: {
      description: `This will list APP doctors`,
      tags: ['APP|Doctor'],
      summary: `APP doctors with pagination`,
      operationId: 'FetchDoctors',
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
    description: 'this will create doctor',
    tags: ['APP|Doctor'],
    summary: 'create doctor',
    operationId: 'CreateDoctor',
    params: Type.Object(
      {
        tenant: Type.String({ format: 'uuid' }),
      },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        otp: Type.String(),
        firstName: Type.String(),
        lastName: Type.String(),
        email: Type.String({ format: 'email' }),
        password: Type.String({
          pattern: '^[a-zA-Z0-9]{3,30}$',
        }),
        phone: Type.String(),
      },
      { additionalProperties: false }
    ),
  },
  update: {
    description: 'this will update doctor',
    tags: ['APP|Doctor'],
    summary: 'update doctor',
    operationId: 'UpdateDoctor',
    params: Type.Object(
      {
        doctorId: Type.String({ format: 'uuid' }),
      },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        firstName: Type.String(),
        lastName: Type.String(),
        dob: Type.Optional(Type.String({ format: 'date' })),
        phone: Type.String(),
        email: Type.String({ format: 'email' }),
        address: Type.Optional(Type.String()),
        gender: Type.Optional(Type.Enum(['MALE', 'FEMALE'])),
        designation: Type.Optional(Type.String()),
        expertise: Type.Optional(Type.String()),
        boardCertification: Type.Optional(Type.String()),
        college: Type.Optional(Type.String()),
        university: Type.Optional(Type.String()),
        fellowship: Type.Optional(Type.String()),
        experience: Type.Optional(Type.Array(Type.String())),
        skill: Type.Optional(Type.Array(Type.String())),
        languages: Type.Optional(Type.Array(Type.String())),
        socialMedia: Type.Optional(Type.Array(Type.String())),
        schedule: Type.Optional(Type.Array(Type.String())),
        biography: Type.Optional(Type.String()),
      },
      {
        additionalProperties: false,
      }
    ),
  },
  delete: {
    description: 'this will delete doctor',
    tags: ['APP|Doctor'],
    summary: 'delete doctor',
    operationId: 'DeleteDoctor',
    params: Type.Object(
      {
        doctorId: Type.String({ format: 'uuid' }),
      },
      { required: 'doctorId' },
      { additionalProperties: false }
    ),
  },
};

export default swagger;
