
import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const invalidPagination = () => {
  throw new AppError(ERROR_DICTIONARY.INVALID_PAGINATION);
};

export const getPagination = (query = {}) => {
  const readPositiveInteger = (value, fallback) => {
    if (value === undefined) return fallback;

    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
      invalidPagination();
    }

    const number = Number(value);
    if (!Number.isSafeInteger(number)) invalidPagination();
    return number;
  };

  const page = readPositiveInteger(query.page, DEFAULT_PAGE);
  const limit = readPositiveInteger(query.limit, DEFAULT_LIMIT);
  const skip = (page - 1) * limit;

  if (limit > MAX_LIMIT || !Number.isSafeInteger(skip)) {
    invalidPagination();
  }

  return { page, limit, skip };
};
