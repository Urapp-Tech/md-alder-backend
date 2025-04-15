import model from '#models/back-office-user.model';
import generateUserTokens from '#utilities/generate-user-tokens';
import HTTP_STATUS from '#utilities/http-status';
import promiseHandler from '#utilities/promise-handler';
import createRedisFunctions from '#utilities/redis-helpers';
import { v4 as uuidv4 } from 'uuid';
import {
  getAccessTokenKey,
  getKeysPattern,
  getRefreshTokenKey,
} from '#utilities/redis-keys';

const login = async (req, body) => {
  const promise = model.superAdminLogin(req);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  const isPasswordMatch = await req.bcrypt.compare(
    body.password,
    result.password
  );

  if (!isPasswordMatch) {
    const err = new Error(`invalid credentials`);
    err.code = HTTP_STATUS.UNAUTHORIZED;
    throw err;
  }

  delete result.password;

  const { id } = result;

  // const [{ branch }] = await model.getBranchById(req, id);
  // result.branch = branch;
  const tokens = await generateUserTokens(req, { id });
  // const tokens = await generateUserTokens(req, { id, tenant, branch });

  return {
    code: HTTP_STATUS.OK,
    message: 'signed in successfully.',
    data: {
      ...result,
      ...tokens,
    },
  };
};

const logout = async (req) => {
  const { id } = req.user;

  const { keys, del } = createRedisFunctions(req.redis);

  if (req.body.invalidateAllTokens) {
    const pattern = getKeysPattern(id);
    const userKeys = await keys(pattern);
    await del(userKeys);

    return {
      code: HTTP_STATUS.OK,
      message: 'signed out successfully.',
    };
  }

  const tokenHash = req.headers.tokenHash;

  const accessTokenKey = getAccessTokenKey(id, tokenHash);
  const refreshTokenKey = getRefreshTokenKey(id, tokenHash);

  await del([accessTokenKey, refreshTokenKey]);

  return {
    code: HTTP_STATUS.OK,
    message: 'signed out successfully.',
  };
};

const list = async (req, params) => {
  const promise = model.superAdminDocList(req, params);

  const [error, result] = await promiseHandler(promise);
  // console.log('result', result);

  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }
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
  const promise = model.docCreate(req, updatedData, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Doctor has been created successfully.',
    data: { ...result },
  };
};

const update = async (req, params) => {
  const promise = model.update(req, req.body, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }
  // console.log('ressss', result);

  return {
    code: HTTP_STATUS.OK,
    message: 'User has been updated successfully.',
    data: { ...result },
  };
};

const deleteUser = async (req, params) => {
  const promise = model.deleteUser(req, params);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'User has been deleted successfully.',
    data: { ...result },
  };
};

export default {
  login,
  logout,
  list,
  create,
  update,
  deleteUser,
};
