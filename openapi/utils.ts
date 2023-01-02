import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types"
import { Ref, Route, Router } from "@soluzioni-futura/openapi-helper"
import ERROR_CODES from "../src/lib/ERROR_CODES"
import USER_ROLES from "../src/lib/USER_ROLES"
import SchemaObject = OpenAPIV3.SchemaObject

export const defineErrorSchema = (errorCodes: ERROR_CODES[]): SchemaObject => ({
  type: "object",
  properties: {
    status: { type: "integer" },
    statusCode: { type: "string" },
    error: {
      type: "object",
      properties: {
        message: { type: "string" },
        code: {
          type: "string",
          enum: errorCodes
        },
        details: {
          type: "object"
        }
      },
      required: ["message", "code"]
    }
  },
  additionalProperties: false,
  required: ["status", "statusCode", "error"]
})

class SfChallengeRouter extends Router {
  constructor(params: { prefix: string, routes: Route[], schemas: Ref[], tags?: string[] }) {
    super({
      ...params,
      headers: {
        "x-user-roles": {
          schema: {
            type: "array",
            items: {
              type: "string",
              enum: Object.values(USER_ROLES)
            }
          }
        }
      }
    })
  }
}

export { Ref, Route, SfChallengeRouter as Router }
