import { Connection } from "typeorm"
import { Tax } from "../entity/Tax"

export const createTax = async (connection: Connection) => {
  try {
    let tax = await connection.manager.findOne(Tax, {
      where: { description: "IVA" },
    })

    if (!tax) {
      tax = new Tax()
      tax.description = "IVA"
      tax.tax = 0.12
      await connection.manager.save(tax)
    }

    console.log(`Impuesto actual: ${tax.description}: ${tax.tax * 100}%`)
  } catch (error) {
    console.log("Ha ocurrido un error al crear el impuesto")
  }
}
