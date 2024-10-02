const parseValidationErrors = (e, req) => {
  if (e.errors) { 
      const keys = Object.keys(e.errors);
      keys.forEach((key) => {
          req.flash("error", key + ": " + e.errors[key].properties.message);
      });
  } else {
      req.flash("error", "An unexpected error occurred");
  }
};

module.exports = parseValidationErrors;