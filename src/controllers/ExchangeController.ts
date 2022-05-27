import { Exchange } from "./../entity/Exchange"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import moment from "moment"

export class ExchangeController {
  async listExchanges(req: Request, res: Response) {
    try {
      const { page, limit, date, dateEnd } = req.query
      const pageNumber = page ? Number(page) : 1
      const limitNumber = page ? Number(limit) : 10

      const query = Exchange.createQueryBuilder("exchange")

      if (date && !dateEnd) {
        query.where("exchange.createdAt = :date", { date })
      }

      if (date && dateEnd) {
        query.where(
          "exchange.createdAt >= :date && exchange.createdAt <= :dateEnd",
          {
            date,
            dateEnd,
          }
        )
      }

      let exchanges = await query
        .orderBy("exchange.createdAt", "DESC")
        .skip(limitNumber * (pageNumber - 1))
        .take(limitNumber)
        .getMany()

      const finalExchanges = exchanges.map((exchange) => ({
        ...exchange,
        editable: moment(exchange.createdAt).isAfter(
          moment().subtract(1, "hours")
        ),
      }))

      const count = await query.getCount()

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: finalExchanges,
        message: "Lista de tasas de cambio.",
        total: count,
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

      if (!moment(exchange.createdAt).isAfter(moment().subtract(1, "hours"))) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          code: StatusCodes.BAD_REQUEST,
          message:
            "No puede modificar la tasa de cambio, porque ya pasó el tiempo mínimo de edición.",
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
      const query = Exchange.createQueryBuilder("exchange")

      const exchange = await query.orderBy("exchange.id", "DESC").getOne()

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
      const query = Exchange.createQueryBuilder("exchange")

      const date = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss")
      const endDate = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss")

      query
        .where("exchange.createdAt >= :date", { date })
        .andWhere("exchange.createdAt <= :dateEnd", { dateEnd: endDate })

      const exchange = await query
        .orderBy("exchange.createdAt", "DESC")
        .getOne()

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
