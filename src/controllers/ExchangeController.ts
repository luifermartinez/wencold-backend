import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { Exchange } from "../entity/Exchange"

export class ExchangeController {
  async listExchanges(req: Request, res: Response) {
    try {
      const { page, limit } = req.query
      const pageNumber = page ? parseInt(page as string) : 1
      const limitNumber = page ? parseInt(limit as string) : 10

      const [exchanges, total] = await Exchange.findAndCount({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        order: {
          createdAt: "DESC",
        },
      })

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: exchanges,
        message: "Lista de tasas de cambio.",
        total,
        page,
        limit,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error al obtener las tasas de cambio",
        error: error,
      })
    }
  }

  async createExchange(req: Request, res: Response) {
    try {
      const { bsEquivalence, useSameAsLast } = req.body

      const exchange = new Exchange()

      if (useSameAsLast && !bsEquivalence) {
        const lastExchange = await Exchange.findOne({
          order: { createdAt: "DESC" },
        })
        if (!lastExchange) {
          return res.status(StatusCodes.NOT_FOUND).json({
            code: StatusCodes.NOT_FOUND,
            message: "Tasa de cambio no encontrada",
          })
        }
        exchange.bsEquivalence = lastExchange.bsEquivalence

        await exchange.save()

        return res.status(StatusCodes.OK).send({
          code: StatusCodes.OK,
          data: exchange,
          message: "Tasa de cambio creada con éxito",
        })
      }

      if (bsEquivalence && !useSameAsLast) {
        exchange.bsEquivalence = bsEquivalence
        await exchange.save()

        return res.status(StatusCodes.OK).send({
          code: StatusCodes.OK,
          data: exchange,
          message: "Tasa de cambio creada con éxito",
        })
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        code: StatusCodes.BAD_REQUEST,
        message: "Debe ingresar una tasa de cambio",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error al crear la tasa de cambio",
        error: error,
      })
    }
  }

  async getExchange(req: Request, res: Response) {
    try {
      const { id } = req.params

      const exchange = await Exchange.findOne({
        where: { id },
      })

      if (!exchange) {
        return res.status(StatusCodes.NOT_FOUND).json({
          code: StatusCodes.NOT_FOUND,
          message: "Tasa de cambio no encontrada",
        })
      }

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: exchange,
        message: "Tasa de cambio obtenida con éxito.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error al obtener la tasa de cambio",
        error: error,
      })
    }
  }

  async updateExchange(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { bsEquivalence } = req.body

      const exchange = await Exchange.findOne({
        where: { id },
      })

      if (!exchange) {
        return res.status(StatusCodes.NOT_FOUND).json({
          code: StatusCodes.NOT_FOUND,
          message: "Tasa de cambio no encontrada",
        })
      }

      exchange.bsEquivalence = bsEquivalence

      await exchange.save()

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: exchange,
        message: "Tasa de cambio actualizada con éxito.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error al actualizar la tasa de cambio",
        error: error,
      })
    }
  }

  async getLastExchange(req: Request, res: Response) {
    try {
      const exchange = await Exchange.findOne({
        order: { createdAt: "DESC" },
      })

      if (!exchange) {
        return res.status(StatusCodes.NOT_FOUND).json({
          code: StatusCodes.NOT_FOUND,
          message: "Tasa de cambio no encontrada",
        })
      }

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: exchange,
        message: "Tasa de cambio obtenida con éxito.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error al obtener la tasa de cambio",
        error: error,
      })
    }
  }

  async getTodayExchange(req: Request, res: Response) {
    try {
      const exchange = await Exchange.findOne({
        where: { createdAt: new Date() },
      })

      if (!exchange) {
        return res.status(StatusCodes.NOT_FOUND).json({
          code: StatusCodes.NOT_FOUND,
          message: "Tasa de cambio no encontrada",
        })
      }

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: exchange,
        message: "Tasa de cambio obtenida con éxito.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error al obtener la tasa de cambio",
        error: error,
      })
    }
  }
}
