export const originalOrigin = (req, options) => {
  options = options || {};
  const app = req.app;
  if (app && app.get && app.get('trust proxy')) {
    options.proxy = true;
  }
  const trustProxy = options.proxy;

  const proto = (req.headers['x-forwarded-proto'] || '').toLowerCase();
  const tls = req.connection.encrypted || (trustProxy && 'https' === proto.split(/\s*,\s*/)[0]);
  const host = (trustProxy && req.headers['x-forwarded-host']) || req.headers.host;
  const protocol = tls ? 'https' : 'http';
  return protocol + '://' + host;
};
