import { join } from "path"
import { config } from "dotenv"
config ({
  path: join(__dirname, "../.env")
})

const { NODE_ENV = "local" } = process.env

import DocsHelperRouter from "@soluzioni-futura/docs-helper"
import ConfigComponent, { ProcessEnvConfigDriver } from "@soluzioni-futura/config-component"
import Debug from "debug"
import cors from "cors"
import compression from "compression"
import { OpenAPIV3, ValidationError } from "express-openapi-validator/dist/framework/types"
import express, { NextFunction, Request, RequestHandler, Response } from "express"
import cookieParser from "cookie-parser"
import { Resolver } from "./lib/Resolver"
import { middleware } from "express-openapi-validator"
import { RouteMetadata } from "express-openapi-validator/dist/framework/openapi.spec.loader"
import USER_ROLES from "./lib/USER_ROLES"
import ERROR_CODES from "./lib/ERROR_CODES"
import ExtendedError from "./lib/ExtendedError"
import { Operations } from "./types"
import def from "./definition.json"
import { TOKEN_TYPE } from "./lib/TOKEN_TYPE"

// OPERATIONS
import helloOperations from "./operations/helloOperations"

// COMPONENTS
import HelloComponent from "./components/helloComponent"
import JWTComponent from "./components/JWTComponent"
import statuses from "statuses"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const definition = def as any

void (async(): Promise<void> => {
  const configKeys = [
    "PORT",
    "JWT_PRIVATE_KEY",
    "DEBUG"
  ]

  const debug = Debug("api")
  const debugAuth = Debug("api:auth")

  const roleRegex = /^(true|false|\s|\|\||\(|\)|&&)+$/
  const allRoles = Object.keys(USER_ROLES) as USER_ROLES[]

  const drivers = [
    new ProcessEnvConfigDriver({ keysToFetch: configKeys })
  ]

  const config = new ConfigComponent({
    drivers
  })

  await config.fetch()
  Debug.enable(config.get("DEBUG")!)

  const app = express()

  const helloComponent = new HelloComponent({})

  const jwtComponent = new JWTComponent({
    secret: config.get("JWT_PRIVATE_KEY")!
  })

  app.use(
    cors(
      (req, callback) => {
        let corsOptions
        if (
          ["/v1/health"].includes(req.path) ||
          ["local", "staging"].includes(NODE_ENV)
        ) {
          corsOptions = { origin: true, credentials: true }
        } else {
          corsOptions = { origin: false }
        }
        callback(null, corsOptions)
      }
    )
  )

  app.use((req, res, next) => {
    req.token = null
    req.userRoles = []
    req.scope = null
    res.set("x-user-roles", [])

    res.sendJsonStatus = (status: number): void => {
      res.status(status).json({
        status,
        statusCode: statuses(status)
      })
    }

    res.error = async(err: ExtendedError | Error, status: number): Promise<void> => {
      if (status === 500) {
        debug("%O", err)
      }

      let code = ERROR_CODES.INTERNAL_SERVER_ERROR
      let details
      if (err.constructor.name === "ExtendedError") {
        const extErr = err as ExtendedError
        code = extErr.code
        details = extErr.details
      }

      const errorObject = {
        status,
        statusCode: statuses(status),
        error: {
          message: status !== 500 || process.env.NODE_ENV === "production" ? err.message : err.stack,
          code,
          details
        }
      }

      res.status(status).json(errorObject)
    }

    next()
  })

  const operations: Operations = Object.entries({
    ...await helloOperations({ helloComponent })
  }).reduce((acc: Operations, [key, value]) => {
    // middleware wrapper for all operations
    acc[key] = (async(req, res, next) => {
      debugAuth("scope %O", req.scope)

      try {
        const { body, token, query } = req

        if (token) {
          req.userRoles.push(...[]) // TODO: add getUserRoles function

          debugAuth("userRoles %O", req.userRoles)
          res.set("x-user-roles", req.userRoles)

          if (req.scope) {
            const expression: string = allRoles.reduce(
              (acc: string, e) =>
                acc.replace(new RegExp(e, "g"), req.userRoles.includes(e).toString())
              , req.scope)

            if (!roleRegex.test(expression)) {
              throw new ExtendedError(ERROR_CODES.INTERNAL_SERVER_ERROR, `Invalid role values: ${req.scope}`)
            }

            if (!eval(expression) as boolean) {
              return res.error(new ExtendedError(ERROR_CODES.FORBIDDEN, "Forbidden"), 403)
            }
          }
        }
      } catch (err) {
        const { code } = err as Error & { code: string }

        switch (code) {
          default:
            return res.error(err as Error, 500)
        }
      }

      value(req, res, next)
    }) as RequestHandler
    return acc
  }, {})

  const resolver = new Resolver({ operations })

  app.set("trust proxy", 1)

  app.use(compression())

  app.disable("x-powered-by")

  app.use(cookieParser())
  app.use(express.json())

  app.get("/", (req, res) => {
    res.sendStatus(200)
  })

  app.use(DocsHelperRouter({
    definition: definition as OpenAPIV3.Document,
    endpoint: "/v1/docs"
  }))

  app.use(
    middleware({
      apiSpec: definition as OpenAPIV3.Document,
      validateRequests: true,
      validateResponses: false,
      operationHandlers: {
        basePath: join(__dirname, "operations"),
        resolver: (handlersPath: string, route: RouteMetadata, apiDoc: OpenAPIV3.Document): RequestHandler => {
          return resolver.resolve(handlersPath, route, apiDoc)
        }
      },

      validateSecurity: {
        handlers: {
          roles: async(req: Request, scopes: string[]): Promise<boolean>  => {
            if (req.get("Authorization")) {
              const token = req.get("Authorization")

              if (scopes.length > 1) {
                throw new ExtendedError(ERROR_CODES.INTERNAL_SERVER_ERROR, `Invalid roles format: ${scopes}`)
              }

              req.scope = scopes[0]

              if (token) {
                req.token = jwtComponent.decode(token.replace("Bearer ", ""), TOKEN_TYPE.AUTH)
              } else {
                throw new ExtendedError(ERROR_CODES.INTERNAL_SERVER_ERROR, "Missing token in request body")
              }
            }
            return true
          }
        }
      }
    })
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error | ExtendedError | ValidationError, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ExtendedError) {
      return res.error(err, 500)
    }

    const validationError = err as ValidationError
    switch (validationError.status) {
      case 404:
        return res.error(new ExtendedError(ERROR_CODES.NOT_FOUND, "Not found"), 404)
      case 400:
        return res.error(new ExtendedError(ERROR_CODES.VALIDATION_ERROR, validationError.message, null, { validationErrors: validationError.errors }), 400)
      case 401:
        return res.error(new ExtendedError(ERROR_CODES.UNAUTHORIZED, validationError.message, null, { validationErrors: validationError.errors }), 401)
      case 403:
        return res.error(new ExtendedError(ERROR_CODES.FORBIDDEN, validationError.message, null, { validationErrors: validationError.errors }), 403)
      case 415:
        return res.error(new ExtendedError(ERROR_CODES.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type"), 415)
    }

    const genericError = err as Error
    res.error(new ExtendedError(ERROR_CODES.INTERNAL_SERVER_ERROR, genericError.message, genericError.stack), 500)
  })

  app.listen(config.get("PORT"), () => {
    debug(`Listening on port ${config.get("PORT")}`)
  })

})()
  .catch(err => {
    // eslint-disable-next-line no-console
    console.error(err)
  })
