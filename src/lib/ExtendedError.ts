import ExtendedError, { ErrorDetails } from "@soluzioni-futura/extended-error"
import ERROR_CODES from "./ERROR_CODES"

class ApiExtendedError extends ExtendedError<ERROR_CODES> {
  constructor(code: ERROR_CODES, message: string | undefined, stack?: string | null, details?: ErrorDetails) {
    super(code, message, stack, details)
  }
}

export default ApiExtendedError
