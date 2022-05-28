import { User } from "./../entity/User"
import { Movement } from "./../entity/Movement"
import { uploadFile } from "./../utils/uploadFile"
import { Exchange } from "./../entity/Exchange"
import { BillOutProduct } from "./../entity/BillOutProduct"
import { BillOut, billOutStatus } from "./../entity/BillOut"
import { Stock } from "./../entity/Stock"
import { ShoppingCart } from "./../entity/ShoppingCart"
import { LoginHistory } from "./../entity/LoginHistory"
import { Request, Response } from "express"
import { getToken } from "../helpers/getToken"
import { StatusCodes } from "http-status-codes"
import { Payment } from "../entity/Payment"
import { Tax } from "../entity/Tax"
import moment from "moment"
import { Image } from "../entity/Image"
import { PaymentMethod } from "../entity/PaymentMethod"
import { paymentStatuses } from "../helpers/paymentStatuses"
import { userRoles } from "../helpers/userRoles"

export class PaymentController {
  async getMyPayments(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { startDate, endDate } = req.query

      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const query = Payment.createQueryBuilder("payment")
        .leftJoinAndSelect("payment.billOut", "billOut")
        .leftJoinAndSelect("billOut.people", "people")
        .leftJoinAndSelect("billOut.billOutProducts", "billOutProducts")
        .leftJoinAndSelect("billOutProducts.product", "product")
        .leftJoinAndSelect("payment.paymentMethod", "paymentMethod")
        .leftJoinAndSelect("payment.paymentProof", "paymentProof")
        .leftJoinAndSelect("billOut.tax", "tax")

      if (userLogin.user.role === userRoles.CUSTOMER) {
        query.where("billOut.people = :people", {
          people: userLogin.user.people.id,
        })
      }

      if (startDate && endDate) {
        query.where(`payment.createdAt BETWEEN :startDate AND :endDate`, {
          startDate,
          endDate,
        })
      }

      const [payments, total] = await query
        .orderBy("payment.createdAt", "DESC")
        .skip(limit * (page - 1))
        .take(limit)
        .getManyAndCount()

      return res.status(StatusCodes.OK).send({
        message: "Pagos encontrados.",
        data: payments,
        total,
        code: StatusCodes.OK,
      })
    } catch (error) {
      console.log(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async getPayments(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { startDate, endDate } = req.query

      const query = Payment.createQueryBuilder("payment")
        .leftJoinAndSelect("payment.billOut", "billout")
        .leftJoinAndSelect("billOut.people", "people")
        .leftJoinAndSelect("billOut.billOutProducts", "billOutProducts")
        .leftJoinAndSelect("billOutProducts.product", "product")
        .leftJoinAndSelect("payment.paymentMethod", "paymentMethod")
        .leftJoinAndSelect("payment.paymentProof", "paymentProof")
        .leftJoinAndSelect("billOut.tax", "tax")

      if (startDate && endDate) {
        query.where(`payment.createdAt BETWEEN :startDate AND :endDate`, {
          startDate,
          endDate,
        })
      }

      const [payments, total] = await query
        .skip(limit * (page - 1))
        .take(limit)
        .getManyAndCount()

      return res.status(StatusCodes.OK).send({
        message: "Pagos encontrados.",
        data: payments,
        total,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async getMyPayment(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const { id } = req.params

      const payment = await Payment.findOne({
        where: { id, user: userLogin.user.id },
      })

      return res.status(StatusCodes.OK).send({
        message: "Pago encontrado.",
        data: payment,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async makeBillOut(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const carts = await ShoppingCart.find({
        where: {
          user: userLogin.user.id,
        },
      })

      if (carts.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No hay productos en el carrito.",
          code: StatusCodes.BAD_REQUEST,
        })
      }

      let stocks: Stock[] = []

      for (let i = 0; i < carts.length; i++) {
        const stock = await Stock.findOne({
          where: {
            product: carts[i].product.id,
          },
        })

        if (!stock) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "Ese producto no existe en el stock.",
            code: StatusCodes.BAD_REQUEST,
          })
        }

        if (stock.available < carts[i].quantity) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "No hay suficiente stock para realizar el pago.",
            code: StatusCodes.BAD_REQUEST,
          })
        }
        stocks.push(stock)
      }

      if (stocks.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No hay suficiente stock para realizar el pago.",
          code: StatusCodes.BAD_REQUEST,
        })
      }

      if (stocks.length !== carts.length) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No hay suficiente stock para realizar el pago.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      const tax = await Tax.findOne()

      if (!tax) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "No hay impuesto registrado, informe a un administrador.",
          data: null,
          code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      }

      const billOut = new BillOut()
      billOut.people = userLogin.user.people
      billOut.tax = tax
      billOut.code = `IW-${moment().format("YYYYMMDDHHmmss")}`
      billOut.billOutDate = new Date()

      let billOutSaved = await billOut.save()

      let billOutProducts: BillOutProduct[] = []

      for (let i = 0; i < carts.length; i++) {
        const billOutProduct = new BillOutProduct()
        billOutProduct.billOut = billOutSaved
        billOutProduct.product = carts[i].product
        billOutProduct.quantity = carts[i].quantity
        billOutProduct.billOutDate = billOutSaved.billOutDate

        billOutProducts.push(billOutProduct)
      }

      if (billOutProducts.length === 0) {
        await billOutSaved.remove()
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Ha ocurrido un error al crear los productos de la factura.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      if (!(await BillOutProduct.save(billOutProducts))) {
        await billOutSaved.remove()
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Ha ocurrido un error al crear los productos de la factura.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }
      if (!ShoppingCart.remove(carts)) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message:
            "Ha ocurrido un error al eliminar los productos del carrito.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      return res.status(StatusCodes.OK).send({
        message: "Factura creada.",
        data: billOutSaved,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async makePayment(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const { reference, amountRef, paymentMethod, billOutCode } = req.body
      const paymentProof = req.files.paymentProof

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      if (!reference) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No se ha ingresado una referencia.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      if (!paymentMethod) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No se ha ingresado una forma de pago.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      const pm = await PaymentMethod.findOne({
        where: { id: paymentMethod },
      })

      const lastExchange = await Exchange.findOne({
        order: {
          id: "DESC",
        },
      })

      if (!lastExchange) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "No hay tasa cambio registrada.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      const tax = await Tax.findOne()

      if (!tax) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "No hay impuesto registrado, informe a un administrador.",
          data: null,
          code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      }

      const billOut = await BillOut.findOne({
        where: {
          code: billOutCode,
        },
      })

      if (!billOut) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "No se ha encontrado la factura.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      if (billOut.people.id !== userLogin.user.people.id) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message:
            "No puedes realizar el pago de una factura que no te pertenece.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      const products = await BillOutProduct.find({
        where: {
          billOut: billOut.id,
        },
      })

      let amount = 0

      for (let i = 0; i < products.length; i++) {
        amount += products[i].quantity * products[i].product.price
      }
      amount = amount * (1 + tax.tax)

      if (Number(amountRef) !== amount) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "El monto de la factura no coincide con el monto ingresado.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      const payment = new Payment()
      payment.billOut = billOut
      payment.reference = reference
      payment.exchange = lastExchange
      payment.amount = amount
      payment.paymentMethod = pm

      if (paymentProof) {
        let patho: any
        let imga: Image
        imga = new Image()
        patho = await uploadFile(
          req.files,
          "paymentProof",
          undefined,
          `billout/payment/${billOut.id}`
        )
        imga.path = patho
        const imageSaved = await Image.save(imga)
        payment.paymentProof = imageSaved
      }

      await payment.save()

      return res.status(StatusCodes.CREATED).send({
        message:
          "Pago realizado con éxito, queda a la espera de que un administrador lo apruebe.",
        code: StatusCodes.CREATED,
        data: payment,
      })
    } catch (error) {
      console.log(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async cancelPayment(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const { id } = req.params

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const payment = await Payment.findOne({
        where: {
          id,
        },
      })

      const billOut = await BillOut.findOne(payment.billOut)

      if (!billOut) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "No se ha encontrado la factura.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      if (billOut.people.id !== userLogin.user.people.id) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message:
            "No puedes cancelar el pago de una factura que no te pertenece.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      if (!payment) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "No se ha encontrado el pago.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      if (payment.status !== paymentStatuses.PENDING) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "El pago no se puede cancelar.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      payment.status = paymentStatuses.CANCELLED

      await payment.save()

      return res.status(StatusCodes.OK).send({
        message: "Pago cancelado exitosamente.",
        code: StatusCodes.OK,
        data: payment,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params

      const { status } = req.body

      const token = getToken(req)
      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const payment = await Payment.findOne({
        where: {
          id,
        },
      })

      if (!payment) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "No se ha encontrado el pago.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      if (payment.status !== paymentStatuses.PENDING) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "El pago no se puede actualizar.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      if (status !== "approved" && status !== "refused") {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "El estado del pago no es válido.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }
      const oldStatus = payment.status

      payment.status = status

      await payment.save()

      if (status === "approved") {
        const billOut = await BillOut.findOne({
          where: {
            id: payment.billOut.id,
          },
        })
        let oldStatusBillOut = billOut.status
        billOut.status = billOutStatus.APPROVED
        await billOut.save()

        const billOutProducts = await BillOutProduct.find({
          where: {
            billOut: billOut.id,
          },
        })

        let stocksArr: Stock[] = []
        let movementArr: Movement[] = []

        for (let i = 0; i < billOutProducts.length; i++) {
          const stock = await Stock.findOne({
            where: {
              product: billOutProducts[i].product.id,
            },
          })
          if (!stock) {
            payment.status = oldStatus
            billOut.status = oldStatusBillOut
            await billOut.save()
            await payment.save()

            return res.status(StatusCodes.NOT_FOUND).send({
              message: "No se ha encontrado el stock.",
              code: StatusCodes.NOT_FOUND,
              data: null,
            })
          }

          let newAvailable = stock.available - billOutProducts[i].quantity
          let newExistence = stock.existence - billOutProducts[i].quantity

          if (newAvailable < 0) {
            payment.status = paymentStatuses.REFUSED
            billOut.status = billOutStatus.REFUSED
            await billOut.save()
            await payment.save()

            return res.status(StatusCodes.BAD_REQUEST).send({
              message: "No hay suficiente stock para realizar la venta.",
              code: StatusCodes.BAD_REQUEST,
              data: null,
            })
          }

          stock.available = stock.available - billOutProducts[i].quantity
          stock.existence = stock.existence - billOutProducts[i].quantity
          stocksArr.push(stock)

          const movement = new Movement()
          movement.description = `Venta de productos de la factura ${billOut.id}`
          movement.movementDate = new Date()
          movement.quantity = -billOutProducts[i].quantity
          movement.stock = stock

          const user = await User.findOne({
            where: {
              people: billOut.people.id,
            },
          })

          movement.user = user ? user : userLogin.user
          movementArr.push(movement)
        }

        await Stock.save(stocksArr)
        await Movement.save(movementArr)

        return res.status(StatusCodes.OK).send({
          message: "Pago aprobado exitosamente.",
          code: StatusCodes.OK,
          data: payment,
        })
      }

      return res.status(StatusCodes.OK).send({
        message: "Pago rechazado exitosamente.",
        code: StatusCodes.OK,
        data: payment,
      })
    } catch (error) {
      console.log(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
