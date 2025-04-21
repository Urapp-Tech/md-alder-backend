import { Type } from '@sinclair/typebox';

const swagger = {
  list: {
    schema: {
      description: `this will list Patients`,
      tags: ['ADMIN|Patients'],
      summary: `Patients with pagination`,
      operationId: 'FetchPatients',
      querystring: Type.Object(
        {
          page: Type.Integer({ default: 0, minimum: 0 }),
          size: Type.Integer({ default: 10, minimum: 10 }),
          search: Type.Optional(Type.String()),
          startDate: Type.Optional(Type.String()),
          endDate: Type.Optional(Type.String()),
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
        email: Type.Union([Type.String({ format: 'email' }), Type.Literal('')]),
        phone: Type.String(),
        gender: Type.String(),
        age: Type.String(),
        address: Type.Optional(Type.String()),
        occupation: Type.Optional(Type.String()),
        desc: Type.Optional(Type.String()),
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
        pId: Type.String({ format: 'uuid' }),
      },
      { required: 'pId' },
      { additionalProperties: false }
    ),
    body: Type.Object(
      {
        name: Type.String(),
        email: Type.Union([Type.String({ format: 'email' }), Type.Literal('')]),
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
  listVisit: {
    schema: {
      description: `this will list Patient visits`,
      tags: ['ADMIN|PatientVisits'],
      summary: `patient visits with pagination`,
      operationId: 'FetchPatientVisits',
      querystring: Type.Object(
        {
          patient: Type.String(),
          page: Type.Integer({ default: 0, minimum: 0 }),
          size: Type.Integer({ default: 10, minimum: 10 }),
          search: Type.Optional(Type.String()),
        },
        { additionalProperties: false }
      ),
    },
  },
  createVisit: {
    description: 'this will create patient visit',
    tags: ['ADMIN|Patient-Visit'],
    summary: 'create patient visit',
    operationId: 'CreatePatientVisit',
    consumes: ['multipart/form-data'],
    body: Type.Object(
      {
        patient: Type.String(),
        medicalNote: Type.Optional(Type.String()),
        chiefComplaint: Type.String(),
        complaintType: Type.String(),
        symptoms: Type.Optional(Type.String()),
        diagnose: Type.Optional(Type.String()),
        differentialDiagnose: Type.Optional(Type.String()),
        complaintDurationStartTime: Type.Optional(Type.String()),
        complaintDurationEndTime: Type.Optional(Type.String()),
        complaintFollowUpTime: Type.Optional(Type.String()),
        prescriptions: Type.Optional(Type.String()),
        cbc: Type.Optional(Type.Boolean()),
        uce: Type.Optional(Type.Boolean()),
        lft: Type.Optional(Type.Boolean()),
        urineDr: Type.Optional(Type.Boolean()),
        biopsy: Type.Optional(Type.Boolean()),
        radiology: Type.Optional(Type.Boolean()),
        otherLabsDesc: Type.Optional(Type.String()),
        imgCaption1: Type.Optional(Type.String()),
        imgCaption2: Type.Optional(Type.String()),
        imgCaption3: Type.Optional(Type.String()),
        avatar: Type.Optional(Type.Any({ isFile: true })),
        lab: Type.Optional(Type.Any({ isFile: true })),
      },
      { additionalProperties: false }
    ),
  },
  previousVisit: {
    schema: {
      description: `this will list Patient previous visits`,
      tags: ['ADMIN|PatientPreviousVisits'],
      summary: `patient previous visits with pagination`,
      operationId: 'FetchPatientPreviousVisits',
      querystring: Type.Object(
        {
          patient: Type.String(),
          page: Type.Integer({ default: 0, minimum: 0 }),
          size: Type.Integer({ default: 10, minimum: 10 }),
          search: Type.Optional(Type.String()),
        },
        { additionalProperties: false }
      ),
    },
  },
};

export default swagger;
