import { Connection } from "typeorm"
import { Exchange } from "./../entity/Exchange"

export const createFirstExchange = async (conn: Connection) => {
  try {
    let exchange = await Exchange.findOne()
    if (!exchange) {
      let firstExchange = new Exchange()
      firstExchange.bsEquivalence = 5.0
      await firstExchange.save()
      console.log(`Primera tasa de cambio: ${firstExchange.bsEquivalence} Bs.D = $ 1`)
    }
  } catch (error) {
    console.log(error)
  }
}
