export const showErrorMessage = (res, error) => {
  res.status(500).json({
    message: error.errors ? error.errors[0].message : error.message,
  });
};
