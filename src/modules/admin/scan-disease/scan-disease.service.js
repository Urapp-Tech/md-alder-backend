import model from '#models/scan-disease.model';
import HTTP_STATUS from '#utilities/http-status';
import promiseHandler from '#utilities/promise-handler';
import { v4 as uuidv4 } from 'uuid';
// import { v4 as uuidv4 } from 'uuid';

const list = async (req, params) => {
  const promise = model.list(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }
  // console.log('response: ', result);

  return {
    code: HTTP_STATUS.OK,
    message: 'Data has been fetched successfully.',
    data: result,
  };
};

const create = async (req, params) => {
  let logoUrl;
  if (req.body.avatar) {
    const fileData = {
      Key: `menu/${uuidv4()}-${req.body.avatar.filename}`,
      Body: req.body.avatar.buffer,
      'Content-Type': req.body.avatar.mimetype,
    };
    try {
      logoUrl = await req.s3Upload(fileData);
    } catch (error) {
      throw new Error(`Failed to upload logo to S3 ${error.message}`);
    }
  }

  const updatedData = {
    results: { type: req.body.results, name: 'acne', percentage: '87' },
    avatar: logoUrl,
  };
  const promise = model.create(req, updatedData, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Scan Analyze successfully.',
    data: { ...result },
  };
};

export default { list, create };
