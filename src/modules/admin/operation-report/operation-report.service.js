import model from '#models/operation-report.model';
import HTTP_STATUS from '#utilities/http-status';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  const promise = model.list(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'operation reports has been fetched successfully.',
    data: result,
  };
};

const create = async (req, params) => {
  const promise = model.create(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'operation reports has been created successfully.',
    data: result,
  };
};

// const update = async (req, params) => {
//   const promise = model.update(req, req.body, params);

//   const [error, result] = await promiseHandler(promise);
//   if (error) {
//     const err = new Error(error.detail ?? error.message);
//     err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
//     throw err;
//   }

//   return {
//     code: HTTP_STATUS.OK,
//     message: 'operation reports has been updated successfully.',
//     data: result,
//   };
// };

// const remove = async (req, params) => {
//   const promise = model.remove(req, params);

//   const [error, result] = await promiseHandler(promise);
//   if (error) {
//     const err = new Error(error.detail ?? error.message);
//     err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
//     throw err;
//   }

//   return {
//     code: HTTP_STATUS.OK,
//     message: 'operation reports has been deleted successfully.',
//     data: result,
//   };
// };

export default {
  list,
  create,
  // update,
  // remove,
};
