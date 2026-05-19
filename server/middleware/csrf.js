

function requireCSRF(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies['XSRF-TOKEN'];
  const csrfHeader = req.headers['x-xsrf-token'];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      message: 'Missing CSRF token',
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      message: 'Invalid CSRF token',
    });
  }

  next();
}