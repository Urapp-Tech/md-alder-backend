import {
  errorHandler,
  // textFilterHelper
} from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
// import POSTGRES_ERROR_CODES from '#utilities/postgres_error_codes';
// import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  const { knex } = req;
  const { startDate, endDate, employee, page, size, branch } = params;

  try {
    if (!startDate || !endDate || !employee) {
      return errorHandler(
        'startDate, endDate, and employee are required query parameters.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return errorHandler(
        'Start date cannot be greater than end date.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const whereCondition =
      employee === 'ALL' ? { branch } : { branch, employee };

    const dataQuery = knex(`${MODULE.ADMIN.OPERATION_REPORT} as opr`)
      .where(whereCondition)
      .leftJoin(`${MODULE.ADMIN.EMPLOYEE} as e`, 'opr.employee', 'e.id')
      .select(
        'opr.*',
        'e.name as employee_name',
        'e.card_number as employee_card_number'
      )
      .andWhereRaw('DATE(opr.created_at) BETWEEN ? AND ?', [startDate, endDate])
      .orderBy('opr.created_at', 'asc')
      .limit(size)
      .offset(page * size);

    const countQuery = knex(MODULE.ADMIN.OPERATION_REPORT)
      .where(whereCondition)
      .andWhereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])
      .count({ total: 'id' })
      .first();

    const [list, total] = await Promise.all([dataQuery, countQuery]);

    return {
      list,
      total: Number(total.total),
    };
    // return {
    //   list,
    //   total: Number(total.total),
    // };
  } catch (error) {
    return errorHandler(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const create = async (req, params) => {
  const { employee, bno, qty, operationCategory, operationCategoryItem } =
    req.body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    const currentDate = new Date().toISOString().split('T')[0];

    const [operationCategoryData, operationCategoryItemData] =
      await Promise.all([
        knex('operation_category')
          .select('name')
          .where({ id: operationCategory })
          .first(),
        knex('operation_category_item')
          .select('name')
          .where({ id: operationCategoryItem })
          .first(),
      ]);

    if (!operationCategoryData || !operationCategoryItemData) {
      return errorHandler(
        'Invalid operationCategory or operationCategoryItem ID',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingRecord = await knex(MODULE.ADMIN.OPERATION_REPORT)
      .select('details')
      .where({
        employee,
      })
      .andWhereRaw('DATE(created_at) = ?', [currentDate])
      .first();

    const newDetail = {
      time: new Date(),
      qty,
      bno,
      operationCategory: {
        id: operationCategory,
        name: operationCategoryData.name,
      },
      operationCategoryItem: {
        id: operationCategoryItem,
        name: operationCategoryItemData.name,
      },
    };

    if (existingRecord) {
      const updatedDetails = [...existingRecord.details, newDetail];

      const [updatedRecord] = await knex(MODULE.ADMIN.OPERATION_REPORT)
        .where({
          employee,
        })
        .andWhereRaw('DATE(created_at) = ?', [currentDate])
        .update({
          details: JSON.stringify(updatedDetails),
          updatedAt: new Date(),
        })
        .returning('*');

      return updatedRecord;
    } else {
      const [newRecord] = await knex(MODULE.ADMIN.OPERATION_REPORT)
        .insert({
          employee,
          details: JSON.stringify([newDetail]),
          tenant: params.tenant,
          branch: params.branch,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning('*');

      return newRecord;
    }
  } catch (error) {
    return errorHandler(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export default {
  list,
  create,
};
