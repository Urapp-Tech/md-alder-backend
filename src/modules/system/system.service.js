import model from '#models/system.config.model';
import HTTP_STATUS from '#utilities/http-status';
import promiseHandler from '#utilities/promise-handler';

const get = async (req, params) => {
  const promise = model.get(req, params);

  const [error, result] = await promiseHandler(promise);

  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }
  return {
    code: HTTP_STATUS.OK,
    message: 'System Config has been fetched successfully.',
    data: result,
  };
};

export default {
  get,
};
