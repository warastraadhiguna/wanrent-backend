import multer from "multer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const parser = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 30,
    parts: 31,
    fieldNestingDepth: 0,
  },
}).single("file");

export const uploadImage = (req, res, next) => {
  parser(req, res, (error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(422).json({ message: "File size is too big > 5 MB" });
    }

    if (
      error.code === "LIMIT_FILE_COUNT" ||
      error.code === "LIMIT_UNEXPECTED_FILE" ||
      error.code === "LIMIT_PART_COUNT"
    ) {
      return res
        .status(422)
        .json({ message: "Only one image file is allowed in field 'file'" });
    }

    return res.status(400).json({ message: "Invalid multipart upload" });
  });
};

export { MAX_IMAGE_SIZE };
