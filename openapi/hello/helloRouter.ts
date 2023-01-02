import { Router } from "../utils"

import hello from "./hello"

import * as schemas from "./hello$ref"

export default new Router({
  prefix: "",
  tags: ["hello"],
  schemas: Object.values(schemas),
  routes: [
    hello
  ]
})
