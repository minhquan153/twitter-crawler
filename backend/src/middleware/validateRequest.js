function validateRequest(schema) {
  return function validate(req, res, next) {
    const details = [];

    if (schema.body) {
      const bodyErrors = schema.body(req.body);
      details.push(...bodyErrors);
    }

    if (schema.query) {
      const queryErrors = schema.query(req.query);
      details.push(...queryErrors);
    }

    if (schema.params) {
      const paramsErrors = schema.params(req.params);
      details.push(...paramsErrors);
    }

    if (details.length > 0) {
      const error = new Error("Invalid request");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = details;
      return next(error);
    }

    return next();
  };
}

module.exports = validateRequest;
