import model from '#models/doctor.model';
import { hashAsync } from '#utilities/bcrypt';
import tenantConfigModel from '#models/tenant-config.model';
import generateUserTokens from '#utilities/generate-user-tokens';
import HTTP_STATUS from '#utilities/http-status';
import { sendSignUpMail } from '#utilities/node-mailer';
import promiseHandler from '#utilities/promise-handler';
import createRedisFunctions from '#utilities/redis-helpers';
import {
  getAccessTokenKey,
  getKeysPattern,
  getRefreshTokenKey,
} from '#utilities/redis-keys';

const login = async (req) => {
  const promise = model.login(req);

  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  const isPasswordMatch = await req.bcrypt.compare(
    req.body.password,
    result.password
  );

  if (!isPasswordMatch) {
    const err = new Error(`invalid credentials`);
    err.code = HTTP_STATUS.UNAUTHORIZED;
    throw err;
  }

  delete result.password;

  const { id, tenant } = result;

  const [{ branch }] = await model.getBranchById(req, tenant);
  result.branch = branch;

  const tokens = await generateUserTokens(req, { id, tenant, branch });

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
  const promise = model.list(req, params);

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

const create = async (req) => {
  const body = req.body;
  delete req.body;
  const isCorrectOTP = await req.otp.verify(req.body.email, req.body.otp);
  if (!isCorrectOTP) {
    const err = new Error(`Invalid otp, please check the otp.`);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  const newPassword = await req.bcrypt.hash(body.password);

  const newData = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    username: body.email,
    password: newPassword,
    phone: body.phone,
    tenant: req.params.tenant,
  };

  const promise = model.create(req, newData);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'User has been created successfully.',
    data: { ...result },
  };
};

const update = async (req) => {
  const body = req.body;
  const newData = {
    ...body,
    experience:
      body.experience && body.experience.length
        ? JSON.stringify(body.experience)
        : undefined,
    skill:
      body.skill && body.skill.length ? JSON.stringify(body.skill) : undefined,
    languages:
      body.languages && body.languages.length
        ? JSON.stringify(body.languages)
        : undefined,
    socialMedia:
      body.socialMedia && body.socialMedia.length
        ? JSON.stringify(body.socialMedia)
        : undefined,
    schedule:
      body.schedule && body.schedule.length
        ? JSON.stringify(body.schedule)
        : undefined,
  };
  const promise = model.update(req, newData);

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

const getOtp = async (req) => {
  const [error, result] = await promiseHandler(
    model.findByEmail(req, req.body.email)
  );

  if (error) {
    const err = new Error(error.detail ?? error.message);
    err.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  if (!result) {
    const err = new Error('This email not exist');
    err.code = HTTP_STATUS.CONFLICT;
    throw err;
  }

  const [tenantConfigError, tenantConfigResult] = await promiseHandler(
    tenantConfigModel.getTenantConfigByTenantId(req, result.tenant)
  );

  if (tenantConfigError) {
    const err = new Error(
      tenantConfigError.detail ?? tenantConfigError.message
    );
    err.code = tenantConfigError.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  const otp = await req.otp.get(req.body.email);
  tenantConfigResult.email = req.body.email;
  const sentMessageInfo = await sendSignUpMail(req, tenantConfigResult, otp);
  if (!sentMessageInfo) {
    const err = new Error('Unable to send email, please check the payload.');
    err.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }
  return {
    code: HTTP_STATUS.OK,
    message: 'email sent successfully.',
    data: { otp: otp, email: req.body.email },
  };
};

const newPassword = async (req) => {
  const { email, password } = req.body;

  // Find user by email
  const [findUserError, findUser] = await promiseHandler(
    model.findByEmail(req, email)
  );

  if (findUserError) {
    const err = new Error(findUserError.detail ?? findUserError.message);
    err.code = findUserError.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  if (!findUser) {
    const err = new Error('User not found. Please check the registered email.');
    err.code = HTTP_STATUS.NOT_FOUND;
    throw err;
  }

  // Verify OTP
  // const [otpError, isCorrectOTP] = await promiseHandler(
  //   OTP.verifyOTP(email, otp)
  // );

  // if (otpError || !isCorrectOTP) {
  //   const err = new Error('Invalid OTP, please check and try again.');
  //   err.code = HTTP_STATUS.BAD_REQUEST;
  //   throw err;
  // }

  // Prepare user data
  const hashedPassword = await hashAsync(password);
  const updatePayload = {
    password: hashedPassword,
    updatedAt: new Date(),
  };

  // Update user
  const [updateError, updateResult] = await promiseHandler(
    model.docUpdate(req, findUser.id, updatePayload)
  );

  if (updateError || !updateResult) {
    const err = new Error(
      'Unable to change your password, please check the payload.'
    );
    err.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw err;
  }

  return {
    code: HTTP_STATUS.OK,
    message: 'Your password has been changed successfully.',
    data: {
      id: findUser.id,
      email: findUser.email,
    },
  };
};

export default {
  login,
  logout,
  list,
  create,
  update,
  deleteUser,
  getOtp,
  newPassword,
};
