/* eslint-disable no-console */
import fetch, { Headers } from "node-fetch"
import Ajv from "ajv"
import definition from "../src/definition.json"
import yargsParser from "yargs-parser"
import { join } from "path"
import { readdirSync, unlink } from "fs"
import { promisify } from "util"

const unlinkP = promisify(unlink)

const {
  url = "http://localhost:8000",
  v = false,
  c = true,
  cl = false
} = yargsParser(process.argv)

const verboseFlag = v
const clearLogs = cl

export const init = async(): Promise<void> => {
  if (clearLogs) {
    console.log("clearign logs folder")
    await Promise.all(readdirSync(join(__dirname, "../logs")).map(f => {
      if (f !== ".gitkeep") {
        return unlinkP(join(__dirname, "../logs", f))
      }
    }))
  }
}

console.log("Api url: %O", url)

export type CallRequest = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any,
  verbose?: boolean,
  method?: string,
  authToken?: string,
  headers?: { [key: string]: string },
  contentType?: string
}

export type CallResponse = {
  status: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  headers: Headers
}

export const call = async(
  path: string,
  {
    body = null,
    verbose = verboseFlag,
    method = "POST",
    headers = {},
    authToken,
    contentType = "application/json"
  }: CallRequest = {}): Promise<CallResponse> => {

  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      "Content-Type": contentType,
      Authorization: authToken || "",
      ...headers
    },
    body: contentType === "application/json" ? body && JSON.stringify(body) : body
  })

  const responseBody = res.headers.get("Content-Type")?.includes("application/json") ? await res.json() : null

  const resData = {
    status: res.status,
    body: responseBody,
    headers: res.headers
  }

  if (verbose) {
    console.dir({
      req: {
        path,
        body
      },
      res: resData
    }, { depth: null })
  }
  return resData
}

const ajv = new Ajv({ nullable: true })

// eslint-disable-next-line @typescript-eslint/ban-types
Object.entries(definition.components.schemas).forEach(([id, schema]): void => {
  ajv.addSchema(
    schema,
    `#/components/schemas/${id}`
  )
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validate = async(schema: any, data: any, verbose = verboseFlag): Promise<null | Ajv.ErrorObject[]> => {
  const validate = ajv.compile(schema)
  const valid = await validate(data)
  if (!valid) {
    if (verbose) {
      console.dir({
        validationErrors: validate.errors
      }, { depth: null })
    }
    return validate.errors!
  } else {
    return null
  }
}
