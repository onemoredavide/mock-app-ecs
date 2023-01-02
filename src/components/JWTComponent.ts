import Debug from "debug"
import ExtendedError from "../lib/ExtendedError"
import ERROR_CODES from "../lib/ERROR_CODES"
import jwt from "jsonwebtoken"

const debug = Debug("component:jwt")

export type JWTGenericPayload = {
  [key: string]: string | number
}

export type JWTStandardPayload = { iat: number, exp: number, userId: number }

export type JWTDecodePayload <T> = T & JWTGenericPayload & JWTStandardPayload
class JWTComponent {
  readonly #secret: string

  constructor(options: { secret: string }) {
    this.#secret = options.secret

  }

  private _generateSecret = (payload: JWTGenericPayload): string => `${this.#secret}${Object.values(payload).map(e => e.toString()).sort().join("-")}${this.#secret}`

  private _formatTimestamp = (timestamp: number): number => Number(timestamp.toString().substr(0, 10))

  sign(payload: JWTGenericPayload & (
      { userId: number } |
      { userId: number, userEmail: string } |
      { email: string, teamId: number } |
      { type: string, submissionId: number }
  ), exiprationTime?: number): string {
    debug("sign %O", payload)
    const now = new Date().getTime()

    if (exiprationTime) {
      payload.exp = this._formatTimestamp(now + exiprationTime)
    }

    return jwt.sign(payload, this._generateSecret({
      ...payload,
      iat: this._formatTimestamp(now)
    }))
  }

  decode<JWTCustomPayload>(token: string, type?: string): JWTDecodePayload<JWTCustomPayload & JWTStandardPayload> {
    debug("decode %O", token)
    let payload: JWTDecodePayload<JWTCustomPayload>
    const now = new Date().getTime()

    try {
      payload = jwt.decode(token, { json: true }) as JWTDecodePayload<JWTCustomPayload>
    } catch (_) {
      throw new ExtendedError(ERROR_CODES.INVALID_JWT, "Invalid token")
    }

    if (!payload || (type && payload.type !== type)) {
      throw new ExtendedError(ERROR_CODES.INVALID_JWT, "Invalid token")
    }

    try {
      jwt.verify(token, this._generateSecret(payload))
    } catch (err) {
      const error = err as { name: string }
      if (error.name === "TokenExpiredError") {
        throw new ExtendedError(ERROR_CODES.EXPIRED_JWT, "Expired token")
      } else {
        throw new ExtendedError(ERROR_CODES.INVALID_JWT, "Invalid token")
      }
    }

    debug("payload %O", payload)

    return payload
  }
}
export default JWTComponent
