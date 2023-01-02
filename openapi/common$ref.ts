import { Ref } from "@soluzioni-futura/openapi-helper"
import ERROR_CODES from "../src/lib/ERROR_CODES"
import { defineErrorSchema } from "./utils"

export const okResponseSchema = new Ref("OkResponseSchema", {
  type: "object",
  properties: {
    status: { type: "integer" },
    statusCode: { type: "string" }
  },
  additionalProperties: false,
  required: ["status", "statusCode"]
})

// ERRORS
export const notFoundErrorResponseSchema = new Ref("NotFoundErrorResponseSchema", defineErrorSchema([ERROR_CODES.NOT_FOUND]))
export const forbiddenErrorResponseSchema = new Ref("ForbiddenErrorResponseSchema", defineErrorSchema([ERROR_CODES.FORBIDDEN]))
export const unauthorizedErrorResponseSchema = new Ref("UnauthorizedErrorResponseSchema", defineErrorSchema([ERROR_CODES.UNAUTHORIZED]))


