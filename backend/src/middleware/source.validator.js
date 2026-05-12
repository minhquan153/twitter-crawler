function validateCreateSourceBody(body = {}) {
  const errors = [];

  if (typeof body.url !== "string" || !body.url.trim()) {
    errors.push({
      field: "url",
      message: "url is required",
    });
  }

  if (
    body.intervalMinutes !== undefined &&
    (!Number.isInteger(Number(body.intervalMinutes)) ||
      Number(body.intervalMinutes) < 1 ||
      Number(body.intervalMinutes) > 1440)
  ) {
    errors.push({
      field: "intervalMinutes",
      message: "intervalMinutes must be an integer from 1 to 1440",
    });
  }

  if (body.enabled !== undefined && typeof body.enabled !== "boolean") {
    errors.push({
      field: "enabled",
      message: "enabled must be a boolean",
    });
  }

  return errors;
}

function validateUpdateSourceBody(body = {}) {
  const errors = [];

  if (
    body.url === undefined &&
    body.intervalMinutes === undefined &&
    body.enabled === undefined
  ) {
    errors.push({
      field: "body",
      message: "At least one field is required",
    });
  }

  if (body.url !== undefined && (typeof body.url !== "string" || !body.url.trim())) {
    errors.push({
      field: "url",
      message: "url must be a non-empty string",
    });
  }

  if (
    body.intervalMinutes !== undefined &&
    (!Number.isInteger(Number(body.intervalMinutes)) ||
      Number(body.intervalMinutes) < 1 ||
      Number(body.intervalMinutes) > 1440)
  ) {
    errors.push({
      field: "intervalMinutes",
      message: "intervalMinutes must be an integer from 1 to 1440",
    });
  }

  if (body.enabled !== undefined && typeof body.enabled !== "boolean") {
    errors.push({
      field: "enabled",
      message: "enabled must be a boolean",
    });
  }

  return errors;
}

module.exports = {
  createSourceSchema: {
    body: validateCreateSourceBody,
  },
  updateSourceSchema: {
    body: validateUpdateSourceBody,
  },
};
