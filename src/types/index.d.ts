/* eslint-disable @typescript-eslint/ban-types */
import type { RequestHandler } from "express"
import type ExtendedError from "../lib/ExtendedError"
import { TOKEN_TYPE } from "../lib/TOKEN_TYPE"
import type USER_ROLES from "../lib/USER_ROLES"

export type Operations = Record<string, RequestHandler>

export type Token = { userId: number, type: TOKEN_TYPE } & { [key: string]: unknown }

export type UserRoles = USER_ROLES[]

type ErrorDetails = { [name: string]: unknown } | undefined

declare global {
  namespace Express {
    interface Request {
      userRoles: UserRoles,
      token: Token | null,
      scope: string | null
    }
    interface Response {
      sendJsonStatus: (status: number) => void,
      error: (error: ExtendedError | Error, statusCode: number) => void
    }
  }
}
