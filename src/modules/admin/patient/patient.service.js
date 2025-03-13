import model from '#models/patient.model';
import HTTP_STATUS from '#utilities/http-status';
import promiseHandler from '#utilities/promise-handler';
import { v4 as uuidv4 } from 'uuid';

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
    ...req.body,
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
    message: 'Patient has been created successfully.',
    data: { ...result },
  };
};

const update = async (req, params) => {
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
    ...req.body,
    avatar: logoUrl,
  };

  const promise = model.update(req, updatedData, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }
  // console.log('ressss', result);

  return {
    code: HTTP_STATUS.OK,
    message: 'Employee has been updated successfully.',
    data: { ...result },
  };
};

const deleteEmp = async (req, params) => {
  const promise = model.deleteEmp(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Employee has been deleted successfully.',
    data: { ...result },
  };
};

const lov = async (req, params) => {
  const promise = model.lov(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }
  // console.log('response: ', result);

  return {
    code: HTTP_STATUS.OK,
    message: 'Employee Lov has been fetched successfully.',
    data: result,
  };
};

const listVisit = async (req, params) => {
  const promise = model.listVisit(req, params);

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

const createVisit = async (req, params) => {
  let avatarUrls = [];
  let avatarFiles = Array.isArray(req.body.avatar)
    ? req.body.avatar
    : [req.body.avatar];

  const captions = [
    req.body.imgCaption1 || '',
    req.body.imgCaption2 || '',
    req.body.imgCaption3 || '',
  ];
  console.log('req.body', req.body);

  if (avatarFiles.length) {
    try {
      const uploadPromises = avatarFiles.map(async (file, index) => {
        const fileData = {
          Key: `menu/${uuidv4()}-${file.filename}`,
          Body: file.buffer,
          'Content-Type': file.mimetype,
        };
        const fileUrl = await req.s3Upload(fileData);
        return { url: fileUrl, caption: captions[index] || '' };
      });

      avatarUrls = await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Failed to upload avatars to S3: ${error.message}`);
    }
  }

  const updatedData = {
    ...req.body,
    tenant: params.tenant,
    patient: req.body.patient,
    prescriptions: req.body.prescriptions,
    scanMedia: JSON.stringify(avatarUrls),
  };
  delete updatedData.avatar;
  delete updatedData.imgCaption1;
  delete updatedData.imgCaption2;
  delete updatedData.imgCaption3;
  const promise = model.createVisit(req, updatedData);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Patient Visit has been created successfully.',
    data: { ...result },
  };
};

export default { list, create, update, deleteEmp, lov, listVisit, createVisit };
