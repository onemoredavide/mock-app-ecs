
import { handleError } from "./utils"
import type { Operations } from "../types"
import HelloComponent from "../components/helloComponent"

export default async({ helloComponent }: { helloComponent: HelloComponent  }): Promise<Operations> => {
  return {
    hello: async({ body }, res): Promise<void> => {
      try {
        const result = await helloComponent.hello(body)
        res.json(result)
      } catch (err) {
        handleError(err, res)
      }
    }
  }
}
