/**
 * Recursively strips any object keys that start with "$" or contain a
 * "." from the given value, in place. This is a lightweight guard
 * against NoSQL-operator injection (e.g. `{ "email": { "$ne": null } }`
 * used to bypass a login check).
 *
 * Express 5 turns `req.query` into a getter-only property, so this
 * middleware must mutate the existing object rather than assigning a
 * brand-new one to `req.query` — hence the manual recursion instead of
 * a library that does `req.query = sanitize(req.query)`.
 */
const sanitizeInPlace = (value) => {
  if (Array.isArray(value)) {
    value.forEach(sanitizeInPlace);
    return value;
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
        continue;
      }
      sanitizeInPlace(value[key]);
    }
  }

  return value;
};

const sanitizeMiddleware = (req, _res, next) => {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query);
  next();
};

module.exports = sanitizeMiddleware;
