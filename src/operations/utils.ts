import ERROR_CODES from "../lib/ERROR_CODES"
import ExtendedError from "@soluzioni-futura/extended-error"
import { Response } from "express"

// eslint-disable-next-line @typescript-eslint/ban-types
export const handleError = (err: unknown, res: Response): void => {
  if (err instanceof ExtendedError) {
    switch (err.code) {
      case ERROR_CODES.INVALID_JWT:
      case ERROR_CODES.EXPIRED_JWT:
      case ERROR_CODES.UNAUTHORIZED:
        return res.error(err, 401)
      case ERROR_CODES.FORBIDDEN:
        return res.error(err, 403)
      case ERROR_CODES.VALIDATION_ERROR:
        return res.error(err, 400)
      case ERROR_CODES.NOT_FOUND:
        return res.error(err, 404)
      case ERROR_CODES.INTERNAL_SERVER_ERROR:
      default:
        return res.error(err, 500)
    }
  } else {
    return res.error(err as Error, 500)
  }
}
