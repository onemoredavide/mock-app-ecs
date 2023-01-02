import helloRouter from "./hello/helloRouter"

import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types"

import * as schemas from "./common$ref"

import { name, version } from "../package.json"

const definition: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    description: `Athletics platform api (${new Date().toISOString()})`,
    version,
    title: name
  },
  servers: [
    {
      description: "local",
      url: "http://localhost:8000/v1"
    }
  ],
  paths: {},
  components: {
    securitySchemes: {
      roles: {
        type: "apiKey",
        in: "header",
        name: "Authorization"
      }
    }
  }
}

Object.values(schemas).forEach(e => {
  e.addToDefinition(definition)
})

helloRouter.addToDefinition(definition)

export default definition
