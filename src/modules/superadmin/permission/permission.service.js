import model from '#models/permission.modal';
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
    message: 'Permissions has been fetched successfully.',
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
    message: 'Permissions has been created successfully.',
    data: { ...result },
  };
};

const childList = async (req, params) => {
  const promise = model.childList(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Permissions has been fetched successfully.',
    data: { ...result },
  };
};

const update = async (req, params) => {
  const promise = model.update(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Permissions has been updated successfully.',
    data: { ...result },
  };
};

const updateStatus = async (req, params) => {
  const promise = model.updateStatus(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Permissions has been updated successfully.',
    data: result[0],
  };
};

const edit = async (req, params) => {
  const promise = model.edit(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Permissions has been fetched successfully.',
    data: { ...result },
  };
};

export default {
  list,
  create,
  childList,
  update,
  updateStatus,
  edit,
};
