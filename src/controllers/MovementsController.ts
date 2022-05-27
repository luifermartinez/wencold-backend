import { Movement } from "./../entity/Movement"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"

export class MovementsControler {
  async getMovements(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { search, startDate, dateEnd } = req.query

      const query = Movement.createQueryBuilder("movement")
        .leftJoinAndSelect("movement.stock", "stock")
        .leftJoinAndSelect("movement.user", "user")
        .leftJoinAndSelect("user.people", "userPeople")
        .leftJoinAndSelect("stock.product", "product")
        .leftJoinAndSelect("product.provider", "provider")
        .leftJoinAndSelect("provider.people", "people")

      if (search) {
        query.where(
          "movement.description LIKE :search OR product.name LIKE :search OR people.firstname LIKE :search OR people.lastname LIKE :search",
          { search: `%${search}%` }
        )
      }

      if (startDate && dateEnd) {
        query.andWhere("movement.createdAt BETWEEN :startDate AND :dateEnd", {
          startDate,
          dateEnd,
        })
      }

      const movements = await query
        .orderBy("movement.id", "DESC")
        .skip(limit * (page - 1))
        .take(limit)
        .getMany()

      const count = await query.getCount()

      return res.status(StatusCodes.OK).send({
        data: movements,
        total: count,
        message: "Movimientos listados.",
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: error,
        data: null,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
