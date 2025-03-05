import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select('employee.*', 'cabin.cabin_number as cabin_name')
    .from(`${MODULE.ADMIN.EMPLOYEE}`)
    .leftJoin(`${MODULE.ADMIN.CABIN_ASSIGN} as assign`, function () {
      this.on('employee.id', '=', 'assign.employee').andOn(
        'assign.is_assign',
        '=',
        knex.raw('true')
      );
    })
    .leftJoin(`${MODULE.ADMIN.CABIN} as cabin`, 'assign.cabin', '=', 'cabin.id')
    .leftJoin(
      `${MODULE.ADMIN.EMPLOYEE_TENANT_BRANCH} as etb`,
      'employee.id',
      '=',
      'etb.employee'
    )
    .where({
      'employee.tenant': params.tenant,
      'employee.is_deleted': false,
    })
    .andWhere((qb) => {
      if (params.branch) {
        qb.andWhere('etb.branch', params.branch);
      }
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere(
          'employee.name',
          'ilike',
          `%${params.search || ''}%`
        ).orWhere('employee.email', 'ilike', `%${params.search || ''}%`);
      }
    })
    .orderBy('employee.created_at', 'desc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = knex
    .count('* as total')
    .from(`${MODULE.ADMIN.EMPLOYEE} as employee`)
    .leftJoin(
      `${MODULE.ADMIN.EMPLOYEE_TENANT_BRANCH} as etb`,
      'employee.id',
      '=',
      'etb.employee'
    )
    .where({
      'employee.tenant': params.tenant,
      'employee.is_deleted': false,
    })
    .andWhere((qb) => {
      if (params.branch) {
        qb.andWhere('etb.branch', params.branch);
      }
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere(
          'employee.name',
          'ilike',
          `%${params.search || ''}%`
        ).orWhere('employee.email', 'ilike', `%${params.search || ''}%`);
      }
    });

  const [error, result] = await promiseHandler(promise);
  const [countError, countResult] = await promiseHandler(countPromise);

  if (error || countError) {
    const newError = new Error(`something went wrong`);
    newError.detail = `something went wrong`;
    newError.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw newError;
  }

  if (!result || !countResult) {
    const newError = new Error(`No employee found`);
    newError.detail = `No employee found`;
    newError.code = HTTP_STATUS.BAD_REQUEST;
    throw newError;
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const create = async (req, body, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex.transaction(async (trx) => {
    try {
      const existingEmployee = await trx(MODULE.ADMIN.EMPLOYEE)
        .leftJoin(
          MODULE.ADMIN.EMPLOYEE_TENANT_BRANCH,
          'employee.id',
          'employee_tenant_branch.employee'
        )
        .where((builder) => {
          if (body.email) builder.orWhere({ 'employee.email': body.email });
          if (body.phone) builder.orWhere({ 'employee.phone': body.phone });
          if (body.cardNumber)
            builder.orWhere({ 'employee.card_number': body.cardNumber });
        })
        .andWhere({
          'employee.is_deleted': false,
          'employee_tenant_branch.branch': params.branch,
        })
        .first();

      if (existingEmployee) {
        const errorMessage = `The Email/Phone is already registered to another patient.`;
        errorHandler(errorMessage, HTTP_STATUS.BAD_REQUEST);
      }

      const branchRecord = await trx(MODULE.ADMIN.BRANCH)
        .where({ id: params.branch })
        .first();

      if (!branchRecord) {
        errorHandler(`No branch found`, HTTP_STATUS.BAD_REQUEST);
      }

      const branchType = branchRecord.branchType === 'MAIN' ? 'MAIN' : 'OTHER';

      const [employee] = await trx(MODULE.ADMIN.EMPLOYEE)
        .insert({
          name: body.name,
          email: body.email,
          cardNumber: body.cardNumber,
          phone: body.phone,
          address: body.address,
          avatar: body.avatar,
          tenant: params.tenant,
        })
        .returning('*');

      await trx(MODULE.ADMIN.EMPLOYEE_TENANT_BRANCH).insert({
        tenant: params.tenant,
        branch: params.branch,
        employee: employee.id,
        type: branchType,
      });

      return employee;
    } catch (error) {
      errorHandler(
        `Error creating employee: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  });
};

const update = async (req, body, params) => {
  const { _email, _phone } = body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const existingEmployee = await knex(MODULE.ADMIN.EMPLOYEE)
    .leftJoin(
      MODULE.ADMIN.EMPLOYEE_TENANT_BRANCH,
      'employee.id',
      'employee_tenant_branch.employee'
    )
    .where((builder) => {
      if (body.email) builder.orWhere({ 'employee.email': body.email });
      if (body.phone) builder.orWhere({ 'employee.phone': body.phone });
      if (body.cardNumber)
        builder.orWhere({ 'employee.card_number': body.cardNumber });
    })
    .andWhere({
      'employee.is_deleted': false,
      'employee_tenant_branch.branch': params.branch,
    })
    .andWhereNot('employee.id', params.empId)
    .first();

  if (existingEmployee) {
    errorHandler(
      `An employee with the email/phone/card-number already exists.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const [updatedEmployee] = await knex(MODULE.ADMIN.EMPLOYEE)
    .update(body)
    .where('id', params.empId)
    .returning('*');

  return updatedEmployee;
};

const deleteEmp = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex(MODULE.ADMIN.EMPLOYEE)
    .where('id', params.empId)
    .update({ isDeleted: true });
};

const lov = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    const employees = await knex
      .select('employee.id', 'employee.name')
      .from(`${MODULE.ADMIN.EMPLOYEE} as employee`)
      .leftJoin(
        `${MODULE.ADMIN.EMPLOYEE_TENANT_BRANCH} as etb`,
        'employee.id',
        'etb.employee'
      )
      .where({
        'employee.tenant': params.tenant,
        'employee.is_deleted': false,
      })
      .andWhere((qb) => {
        if (params.branch) {
          qb.andWhere('etb.branch', params.branch);
        }
      })
      .orderBy('employee.name', 'asc');

    return employees;
  } catch (error) {
    errorHandler(
      `Error fetching employee LOV: ${error.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export default {
  list,
  create,
  update,
  deleteEmp,
  lov,
};
