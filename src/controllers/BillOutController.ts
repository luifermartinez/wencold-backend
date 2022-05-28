import { Exchange } from "./../entity/Exchange"
import { paymentStatuses } from "./../helpers/paymentStatuses"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"
import { BillOut } from "../entity/BillOut"
import { LoginHistory } from "../entity/LoginHistory"
import { getToken } from "../helpers/getToken"
import { userRoles } from "../helpers/userRoles"

export class BillOutController {
  async getBillOuts(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { startDate, endDate, status } = req.query

      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const query = BillOut.createQueryBuilder("billOut")
        .leftJoinAndSelect("billOut.people", "people")
        .leftJoinAndSelect("billOut.billOutProducts", "billOutProducts")
        .leftJoinAndSelect("billOutProducts.product", "product")
        .leftJoinAndSelect("billOut.tax", "tax")
        .leftJoinAndSelect("billOut.payment", "payment")
        .leftJoinAndSelect("payment.paymentMethod", "paymentMethod")
        .leftJoinAndSelect("payment.paymentProof", "paymentProof")

      if (userLogin.user.role === userRoles.CUSTOMER) {
        query.where("billOut.people = :people", {
          people: userLogin.user.people.id,
        })
      }

      if (startDate && endDate) {
        query.andWhere("billOut.billOutDate BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        })
      }

      if (
        status === paymentStatuses.APPROVED ||
        status === paymentStatuses.PENDING ||
        status === paymentStatuses.REFUSED ||
        status === paymentStatuses.CANCELLED
      ) {
        query.andWhere("payment.status = :status", { status })
      }

      if (status === "non-payed") {
        query.andWhere("billOut.payment IS NULL")
      }

      const [billOuts, total] = await query
        .orderBy("billOut.id", "DESC")
        .skip(limit * (page - 1))
        .take(limit)
        .getManyAndCount()

      return res.status(StatusCodes.OK).send({
        message: "Facturas encontradas.",
        data: billOuts,
        total,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error al obtener las ordenes.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async getBillOut(req: Request, res: Response) {
    try {
      const { id } = req.params

      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const billOut = await BillOut.createQueryBuilder("billOut")
        .leftJoinAndSelect("billOut.people", "people")
        .leftJoinAndSelect("billOut.billOutProducts", "billOutProducts")
        .leftJoinAndSelect("billOutProducts.product", "product")
        .leftJoinAndSelect("product.productImage", "productImage")
        .leftJoinAndSelect("productImage.image", "image")
        .leftJoinAndSelect('product.productType', 'productType')
        .leftJoinAndSelect("billOut.tax", "tax")
        .leftJoinAndSelect("billOut.payment", "payment")
        .leftJoinAndSelect("payment.paymentMethod", "paymentMethod")
        .leftJoinAndSelect("payment.paymentProof", "paymentProof")
        .where("billOut.id = :id", { id })
        .getOne()

      if (userLogin.user.role === userRoles.CUSTOMER) {
        if (userLogin.user.people.id !== billOut.people.id) {
          return res.status(StatusCodes.UNAUTHORIZED).send({
            message: "No tienes permisos para ver esta factura.",
            code: StatusCodes.UNAUTHORIZED,
          })
        }
      }

      if (!billOut) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Factura no encontrada.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      const lastExchange = await Exchange.findOne({
        order: {
          id: "DESC",
        },
      })

      return res.status(StatusCodes.OK).send({
        message: "Factura encontrada.",
        data: { ...billOut, exchange: lastExchange },
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error al obtener la factura.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
