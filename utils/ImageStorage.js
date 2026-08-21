import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const imagesDirectory = path.resolve(currentDirectory, "../public/images");
const outputByFormat = {
  jpeg: { extension: ".jpg", options: { quality: 85, mozjpeg: true } },
  png: { extension: ".png", options: { compressionLevel: 9 } },
  webp: { extension: ".webp", options: { quality: 85 } },
};

export class InvalidImageError extends Error {}

export const saveImage = async (file) => {
  if (!file?.buffer) return null;

  let metadata;
  let encoded;
  try {
    const image = sharp(file.buffer, {
      failOn: "error",
      limitInputPixels: 40_000_000,
      animated: false,
    });
    metadata = await image.metadata();
    const output = outputByFormat[metadata.format];

    if (!output) throw new InvalidImageError();

    encoded = await image
      .rotate()
      .toFormat(metadata.format, output.options)
      .toBuffer();
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError("Invalid or corrupted image");
  }

  const output = outputByFormat[metadata.format];
  const fileName = `${crypto.randomBytes(20).toString("hex")}${output.extension}`;
  const destination = path.join(imagesDirectory, fileName);
  await fs.mkdir(imagesDirectory, { recursive: true });
  await fs.writeFile(destination, encoded, { flag: "wx", mode: 0o644 });

  return { fileName, url: `images/${fileName}` };
};

export const removeImage = async (fileName) => {
  if (!fileName || path.basename(fileName) !== fileName) return;

  try {
    await fs.unlink(path.join(imagesDirectory, fileName));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

export const removeImageSafely = async (fileName) => {
  try {
    await removeImage(fileName);
  } catch (error) {
    console.error("Unable to remove image file:", error.message);
  }
};

export const handleImageError = (res, error) => {
  if (error instanceof InvalidImageError) {
    res.status(422).json({
      message: "Invalid image. Only valid JPEG, PNG, or WebP files are allowed",
    });
    return true;
  }
  return false;
};
