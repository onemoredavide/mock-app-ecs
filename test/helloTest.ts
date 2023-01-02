import { call, validate, init } from "./utils"
import { expect } from "chai"
import { describe, it, before } from "mocha"
import definition from "../src/definition.json"
import { Hello200ResponseSchema, HelloRequestSchema } from "../src/types/generated/openapi"

const {
  schemas
} = definition.components

describe("news", function() {
  before(async() => {
    await init()
  })

  describe("hello", async function() {
    it("hello:200", async function() {
      const { status, body } = await call("/v1/hello", {
        body: {
          name: "Sample"
        } as HelloRequestSchema
      })

      expect(status, "status").to.be.equal(200)
      expect(await validate(
        schemas.Hello200ResponseSchema, body
      ), "response body validation errors").to.be.null

      const typedBody = body as Hello200ResponseSchema
      expect(typedBody.data).to.be.equal("Hello Sample!")
    })

    it("hello:400", async function() {
      const { status, body } = await call("/v1/hello", {
        body: {
          name: "A"
        } as HelloRequestSchema
      })

      expect(status, "status").to.be.equal(400)
      expect(await validate(
        schemas.Hello400ResponseSchema, body
      ), "response body validation errors").to.be.null
    })
  })

})
