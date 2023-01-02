import { RouteMetadata } from "express-openapi-validator/dist/framework/openapi.spec.loader"
import { RequestHandler } from "express"
import { Operations } from "../types"
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types"

export class Resolver {
  private operations: Operations

  constructor({ operations }: { operations: Operations }) {
    this.operations = operations
  }

  public resolve(handlersPath: string, route: RouteMetadata, apiDoc: OpenAPIV3.Document): RequestHandler {
    const { basePath, openApiRoute, method } = route
    const pathKey = openApiRoute.substring(basePath.length)
    const { operationId } = (apiDoc.paths[pathKey])[method.toLowerCase() as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject
    const handler = this.operations[operationId!]
    if (handler === undefined) {
      throw new Error(`Missing operation for ${operationId}`)
    }
    return handler
  }
}
