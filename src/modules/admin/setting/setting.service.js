import model from '#models/setting.model';
import HTTP_STATUS from '#utilities/http-status';
import promiseHandler from '#utilities/promise-handler';
import { v4 as uuidv4 } from 'uuid';

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
    message: 'Data has been fetched successfully.',
    data: result,
  };
};

const update = async (req, params) => {
  const { body } = req;
  let logoUrl;
  let bannerUrl;

  if (body.logo) {
    const fileData = {
      Key: `menu/${uuidv4()}-${body.logo.filename}`,
      Body: body.logo.buffer,
      'Content-Type': body.logo.mimetype,
    };
    try {
      logoUrl = await req.s3Upload(fileData);
    } catch (error) {
      // console.error('S3 upload failed:', error);
      throw new Error(`Failed to upload logo to S3 ${error.message}`);
    }
  }
  if (body.banner) {
    const fileBannerData = {
      Key: `menu/${uuidv4()}-${body.banner.filename}`,
      Body: body.banner.buffer,
      'Content-Type': body.banner.mimetype,
    };
    try {
      bannerUrl = await req.s3Upload(fileBannerData);
    } catch (error) {
      // console.error('S3 upload failed:', error);
      throw new Error(`Failed to upload logo to S3 ${error.message}`);
    }
  }
  const updatedData = {
    ...body,
    logo: logoUrl,
    banner: bannerUrl,
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
    message: 'Setting has been updated successfully.',
    data: { ...result },
  };
};

export default {
  get,
  update,
};
