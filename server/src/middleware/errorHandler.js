export function notFound(_req, res) {
  res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'This case file could not be found.' } });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.name === 'ZodError' ? 400 : 500);
  const code = error.code || (status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');
  if (status >= 500) console.error(JSON.stringify({ level: 'error', code, message: error.message, detail: error.detail }));
  const message = status >= 500 && error.code !== 'GENERATION_INVALID' ? 'The service could not complete that request. Please try again.' : error.message;
  res.status(status).json({ success: false, data: null, error: { code, message } });
}
