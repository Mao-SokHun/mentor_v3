export const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const created = (res, data = null, message = 'Created successfully', statusCode = 201) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const paginated = (res, data = [], pagination = {}, message = 'Data retrieved successfully', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
};

export const badRequest = (res, message = 'Bad request', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error_code: 'BAD_REQUEST'
  });
};

export const notFound = (res, message = 'Resource not found', statusCodeOrErrorCode = 404) => {
  let statusCode = 404;
  let errorCode = 'NOT_FOUND';

  if (typeof statusCodeOrErrorCode === 'number') {
    statusCode = statusCodeOrErrorCode;
  } else if (typeof statusCodeOrErrorCode === 'string') {
    errorCode = statusCodeOrErrorCode;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error_code: errorCode
  });
};

export const unauthorized = (res, message = 'Unauthorized', statusCode = 401) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error_code: 'UNAUTHORIZED'
  });
};

export const forbidden = (res, message = 'Forbidden', statusCode = 403) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error_code: 'FORBIDDEN'
  });
};

export const serverError = (res, message = 'Internal server error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error_code: 'INTERNAL_SERVER_ERROR'
  });
};

export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, statusCode = 500, message = 'Error', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
};
