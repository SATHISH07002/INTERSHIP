export const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error("Access denied for this role");
    error.statusCode = 403;
    throw error;
  }

  next();
};
