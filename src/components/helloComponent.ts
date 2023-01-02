import ExtendedError from "@soluzioni-futura/extended-error"
import Debug from "debug"
import ERROR_CODES from "../lib/ERROR_CODES"
import { Hello200ResponseSchema, HelloRequestSchema } from "../types/generated/openapi"

const debug = Debug("component:hello")

class HelloComponent {

  constructor(options: {}) {}

  hello = async(data: HelloRequestSchema): Promise<Hello200ResponseSchema> => {
    debug("hello, %o", data)

    if (data.name.length < 3) {
      throw new ExtendedError(ERROR_CODES.VALIDATION_ERROR, "Name must have at least 3 character")
    }

    return {
      data: `Hello ${data.name}!`
    }
  }

}

export default HelloComponent
