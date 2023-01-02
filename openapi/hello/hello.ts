import { Route } from "@soluzioni-futura/openapi-helper"
import { defineErrorSchema } from "../utils"
import ERROR_CODES from "../../src/lib/ERROR_CODES"
import { name } from "./hello$ref"

export default new Route({
  description: "hello",
  operationId: "hello",
  requestSchema: {
    type: "object",
    properties: {
      name: name.$ref
    },
    additionalProperties: false,
    required: [
      "name"
    ]
  },
  responsesSchemas: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "string"
        }
      },
      additionalProperties: false,
      required: ["data"]
    },
    400: defineErrorSchema([ERROR_CODES.VALIDATION_ERROR]),
    404: defineErrorSchema([ERROR_CODES.NOT_FOUND])
  }
  // security: [{ roles: [`${USER_ROLES.ADMIN}`] }]
})
