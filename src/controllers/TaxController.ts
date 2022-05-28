import { Request, Response } from "express"
import { Tax } from "../entity/Tax"

export class TaxController {
  async getTax(req: Request, res: Response) {
    try {
      const tax = await Tax.findOne()

      if (!tax) {
        return res.status(404).send({
          message: "Impuesto no encontrado.",
          data: null,
          code: 404,
        })
      }

      return res.status(200).send({
        message: "Impuesto encontrado.",
        data: tax,
        code: 200,
      })
    } catch (error) {
      return res.status(500).send({
        message: "Error al obtener el impuesto.",
        data: error,
        code: 500,
      })
    }
  }

  async updateTax(req: Request, res: Response) {
    try {
      const tax = await Tax.findOne()

      if (!tax) {
        return res.status(404).send({
          message: "Impuesto no encontrado.",
          data: null,
          code: 404,
        })
      }

      const { value } = req.body

      tax.tax = value

      await tax.save()

      return res.status(200).send({
        message: "Impuesto actualizado.",
        data: tax,
        code: 200,
      })
    } catch (error) {
      return res.status(500).send({
        message: "Error al actualizar el impuesto.",
        data: error,
        code: 500,
      })
    }
  }
}
