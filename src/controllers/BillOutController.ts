import { Movement } from "./../entity/Movement"
import { BillOutProduct } from "./../entity/BillOutProduct"
import moment from "moment"
import { Tax } from "./../entity/Tax"
import { Stock } from "./../entity/Stock"
import { Exchange } from "./../entity/Exchange"
import { paymentStatuses } from "./../helpers/paymentStatuses"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"
import { BillOut, billOutStatus } from "../entity/BillOut"
import { LoginHistory } from "../entity/LoginHistory"
import { getToken } from "../helpers/getToken"
import { userRoles } from "../helpers/userRoles"
import { People } from "../entity/People"
import { Product } from "../entity/Product"

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
        .leftJoinAndSelect("product.productType", "productType")
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
  async makeBillOut(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const { people, products } = req.body

      const PEOPLE = new People()
      PEOPLE.firstname = people.firstname
      PEOPLE.lastname = people.lastname
      PEOPLE.dni = people.dni
      PEOPLE.address = people.address
      PEOPLE.phone = people.phone

      const peopleSaved = await PEOPLE.save()
      if (!peopleSaved) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Error al guardar los datos del cliente.",
          data: null,
          code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      }

      if (products.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No se puede crear una factura sin productos.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      let stocks: Stock[] = []

      for (let i = 0; i < products.length; i++) {
        const stock = await Stock.findOne({
          where: {
            product: products[i].product.id,
          },
        })

        if (!stock) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "Ese producto no existe en el stock.",
            code: StatusCodes.BAD_REQUEST,
          })
        }

        if (stock.available < products[i].quantity) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "No hay suficiente stock para realizar la venta.",
            code: StatusCodes.BAD_REQUEST,
          })
        }
        stocks.push(stock)
      }

      if (stocks.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No hay suficiente stock para realizar la venta.",
          code: StatusCodes.BAD_REQUEST,
        })
      }

      if (stocks.length !== products.length) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No hay suficiente stock para realizar la venta.",
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
      billOut.people = peopleSaved
      billOut.tax = tax
      billOut.code = `IW-${moment().format("YYYYMMDDHHmmss")}`
      billOut.billOutDate = new Date()
      billOut.status = billOutStatus.APPROVED

      let billOutSaved = await billOut.save()

      if (!billOutSaved) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Error al guardar la factura.",
          data: null,
          code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      }

      let billOutProducts: BillOutProduct[] = []

      for (let i = 0; i < products.length; i++) {
        const billOutProduct = new BillOutProduct()
        billOutProduct.billOut = billOutSaved
        billOutProduct.product = products[i].product
        billOutProduct.quantity = products[i].quantity
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

      let stocksArr: Stock[] = []
      let movementArr: Movement[] = []

      for (let i = 0; i < billOutProducts.length; i++) {
        const stock = await Stock.findOne({
          where: {
            product: billOutProducts[i].product.id,
          },
        })
        if (!stock) {
          await billOut.save()

          return res.status(StatusCodes.NOT_FOUND).send({
            message: "No se ha encontrado el stock.",
            code: StatusCodes.NOT_FOUND,
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

        movement.user = userLogin.user
        movementArr.push(movement)
      }

      await Stock.save(stocksArr)
      await Movement.save(movementArr)

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

  async findCustomer(req: Request, res: Response) {
    try {
      const { dni } = req.query
      const people = await People.findOne({
        where: {
          dni,
        },
      })

      if (!people) {
        return res.status(StatusCodes.OK).send({
          message: "No se ha encontrado el cliente.",
          data: null,
          code: StatusCodes.OK,
        })
      }

      return res.status(StatusCodes.OK).send({
        message: "Cliente encontrado.",
        data: people,
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

  /*
    Obtiene todos los productos vendidos en un periodo de tiempo determinado, 
    los agrupa por id de producto,
    suma la cantidad de cada producto y los ordena por cantidad.
   */
  async getMostSoldProducts(req: Request, res: Response) {
    try {
      let startDate: Date | null = null
      let endDate: Date | null = null

      if (req.query.startDate && req.query.endDate) {
        startDate = moment(String(req.query.startDate)).startOf("day").toDate()
        endDate = moment(String(req.query.endDate)).endOf("day").toDate()
      }

      const query = BillOutProduct.createQueryBuilder(
        "billOutProduct"
      ).leftJoinAndSelect("billOutProduct.product", "product")

      if (startDate && endDate) {
        query.where(
          "billOutProduct.billOutDate BETWEEN :startDate AND :endDate",
          {
            startDate,
            endDate,
          }
        )
      }

      const billOutProducts = await query.getMany()

      if (!billOutProducts) {
        return res.status(StatusCodes.OK).send({
          message: "No se han encontrado productos vendidos.",
          data: null,
          code: StatusCodes.OK,
        })
      }

      const products = billOutProducts.map((billOutProduct) => {
        return {
          product: billOutProduct.product,
          quantity: billOutProduct.quantity,
        }
      })

      const productsGrouped = products.reduce((acc, cur) => {
        const product = acc.find(
          (product) => product.product.id === cur.product.id
        )
        if (product) {
          product.quantity += cur.quantity
        } else {
          acc.push(cur)
        }
        return acc
      }, [])

      const productsSorted = productsGrouped.sort((a, b) => {
        return b.quantity - a.quantity
      })

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        productsSorted,
        message: "Productos más vendidos encontrados.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async getLessSoldProducts(req: Request, res: Response) {
    try {
      let startDate: Date | null = null
      let endDate: Date | null = null

      if (req.query.startDate && req.query.endDate) {
        startDate = moment(String(req.query.startDate)).startOf("day").toDate()
        endDate = moment(String(req.query.endDate)).endOf("day").toDate()
      }

      const query = BillOutProduct.createQueryBuilder(
        "billOutProduct"
      ).leftJoinAndSelect("billOutProduct.product", "product")

      if (startDate && endDate) {
        query.where(
          "billOutProduct.billOutDate BETWEEN :startDate AND :endDate",
          {
            startDate,
            endDate,
          }
        )
      }

      const billOutProducts = await query.getMany()

      if (!billOutProducts) {
        return res.status(StatusCodes.OK).send({
          message: "No se han encontrado productos vendidos.",
          data: null,
          code: StatusCodes.OK,
        })
      }

      const products = billOutProducts.map((billOutProduct) => {
        return {
          product: billOutProduct.product,
          quantity: billOutProduct.quantity,
        }
      })

      const productsGrouped = products.reduce((acc, cur) => {
        const product = acc.find(
          (product) => product.product.id === cur.product.id
        )
        if (product) {
          product.quantity += cur.quantity
        } else {
          acc.push(cur)
        }
        return acc
      }, [])

      const productsSorted = productsGrouped.sort((a, b) => {
        return a.quantity - b.quantity
      })

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        productsSorted,
        message: "Productos menos vendidos encontrados.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
