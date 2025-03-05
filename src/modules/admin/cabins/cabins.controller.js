import promiseHandler from '#utilities/promise-handler';
import service from './cabins.service.js';

const list = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  // console.log('params: ' + params);

  const promise = service.list(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
    data: result.data,
  });
};

const create = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  const promise = service.create(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
    data: result.data,
  });
};

const update = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  const promise = service.update(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
    data: result.data,
  });
};

const deleteCabin = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  const promise = service.deleteCabin(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
  });
};

const lov = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };

  const promise = service.lov(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
    data: result.data,
  });
};

const assign = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  const promise = service.assign(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );
  // console.log('result', result);

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
    data: result.data,
  });
};

const scanner = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  const promise = service.scanner(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
  });
};

const history = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  const promise = service.history(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
    data: result.data,
  });
};

const cabinHistory = async (req, res) => {
  const log = req.logger;
  log.verbose(`RequestId:: ${req.id}\nHandling ${req.method} ${req.url} Route`);
  const params = {
    ...req.user,
    ...req.params,
    ...req.query,
  };
  const promise = service.cabinHistory(req, params);
  const [error, result] = await promiseHandler(promise);
  if (error) {
    log.verbose(
      `RequestId:: ${req.id}\nHandling Completed With Error On ${req.method} ${req.url} Route`
    );
    log.error(
      `${error.message}\nRequestId:: ${req.id}\nTrace:: ${error.stack}`
    );

    return res.status(error.code).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  log.verbose(
    `RequestId:: ${req.id}\nHandling Completed With Success On ${req.method} ${req.url} Route`
  );

  return res.status(result.code).send({
    success: true,
    code: result.code,
    message: result.message,
    data: result.data,
  });
};

export default {
  list,
  create,
  update,
  deleteCabin,
  lov,
  assign,
  scanner,
  history,
  cabinHistory,
};
