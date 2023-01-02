/* eslint-disable no-console */
const OpenAPI = require("openapi-typescript-codegen")
import definition from "../openapi/definition"
import { copySync, readFileSync, removeSync, writeFileSync, readdirSync, unlink, ensureDirSync } from "fs-extra"
import { promisify } from "util"
import { join } from "path"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types"
const refParser = new $RefParser()

const unlinkP = promisify(unlink)

const tempPath = join(__dirname, "../temp")
const generatedTypesSrc = join(tempPath, "models")
const generatedTypesDest = join(__dirname, "../src/types/generated/openapi")

void (async(): Promise<void> => {
  console.log("Compiling open api definition...")
  await OpenAPI.generate({
    input: definition,
    output: tempPath,
    exportCore: false,
    exportServices: false
  })


  ensureDirSync(generatedTypesDest)
  const srcFiles = readdirSync(generatedTypesSrc)
  await Promise.all(readdirSync(generatedTypesDest)
    .filter(e => ![".gitkeep", "index.ts"].includes(e) && !srcFiles.includes(e))
    .map(e => unlinkP(join(generatedTypesDest, e))))

  copySync(generatedTypesSrc, generatedTypesDest)
  writeFileSync(join(generatedTypesDest, "index.ts"), readFileSync(join(tempPath, "index.ts"), "utf-8").replace(/.\/models\//g, "./"))
  writeFileSync(join(__dirname, "../src/definition.json"), JSON.stringify(definition))

  const derefDefinition = await refParser.dereference(definition, { dereference: { circular: "ignore" } }) as OpenAPIV3.Document
  writeFileSync(join(__dirname, "../src/definition-deref-schemas.json"), JSON.stringify(derefDefinition.components!.schemas!))
  removeSync(tempPath)

  console.log("Open api definition compiled!")
})()
  .catch(console.error)

