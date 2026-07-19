function validateMiddleware(schema) {
  return (req, res, next) => {
    if (!schema) return next();
    const { error, value } = schema.validate ? schema.validate(req.body) : { value: req.body };
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details ? error.details[0].message : error.message,
      });
    }
    req.body = value;
    next();
  };
}

module.exports = validateMiddleware;
