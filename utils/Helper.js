export const showErrorMessage = (res, error) => {
  const errorName =
    typeof error?.name === "string" && /^[A-Za-z0-9_. -]{1,80}$/.test(error.name)
      ? error.name
      : "Error";

  console.error(`Internal server error (${errorName})`);
  res.status(500).json({
    message: "Internal server error",
  });
};
