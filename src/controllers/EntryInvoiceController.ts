import { LoginHistory } from "./../entity/LoginHistory"
import { getConnection } from "typeorm"
import { Stock } from "./../entity/Stock"
import { Movement } from "./../entity/Movement"
import { ProductType } from "./../entity/ProductType"
import { EntryInvoiceProduct } from "./../entity/EntryInvoiceProduct"
import { Provider } from "./../entity/Provider"
import { Product } from "./../entity/Product"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"
import { EntryInvoice } from "../entity/EntryInvoice"
import { getToken } from "../helpers/getToken"
import { ReturnProduct } from "../entity/ReturnProduct"
import moment from "moment"

export class EntryInvoiceController {
  async create(req: Request, res: Response) {
    try {
      let { products, code } = req.body

      products = JSON.parse(products)
      code = code.slice(1, -1)

      if (!products || !code) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Petición inválida.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      const connection = getConnection()
      const queryRunner = connection.createQueryRunner()

      await queryRunner.connect()

      await queryRunner.startTransaction()

      const token = getToken(req)

      const user = (
        await LoginHistory.findOne({
          where: { token },
        })
      ).user

      const existEntryInvoice = await EntryInvoice.findOne({
        where: {
          code: code,
        },
      })

      if (existEntryInvoice) {
        return res.status(StatusCodes.CONFLICT).send({
          code: StatusCodes.CONFLICT,
          data: null,
          message: "Ya existe una entrada con ese codigo de factura.",
        })
      }

      const entryInvoice = new EntryInvoice()
      entryInvoice.code = code

      if (!(await queryRunner.manager.save(entryInvoice))) {
        await queryRunner.rollbackTransaction()
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al crear la factura de entrada.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      let productsArr: Product[] = []
      let entryInvoiceProducts: EntryInvoiceProduct[] = []
      let stocks: Stock[] = []
      let movements: Movement[] = []

      for (let i = 0; i < products.length; i++) {
        const element = products[i]
        const quantity = Number(element.quantity)
        let product = await Product.findOne({
          where: {
            code: element.code,
          },
        })

        if (!product) {
          product = new Product()
          product.name = element.name
          product.code = element.code
        }

        if (element.warrantyUpTo) product.warrantyUpTo = element.warrantyUpTo
        product.price = element.price

        const provider = await Provider.findOne(element.provider.id)

        if (!provider) {
          await queryRunner.rollbackTransaction()
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "El proveedor no existe.",
            code: StatusCodes.BAD_REQUEST,
            data: null,
          })
        }

        const productType = await ProductType.findOne(element.productType.id)

        if (!productType) {
          await queryRunner.rollbackTransaction()
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "El tipo de producto no existe.",
            code: StatusCodes.BAD_REQUEST,
            data: null,
          })
        }

        product.provider = provider
        product.productType = productType

        productsArr.push(product)

        const entryInvoiceProduct = new EntryInvoiceProduct()
        entryInvoiceProduct.product = product
        entryInvoiceProduct.quantity = quantity
        entryInvoiceProduct.entryInvoice = entryInvoice

        entryInvoiceProducts.push(entryInvoiceProduct)

        let stock = await Stock.findOne({
          where: {
            product: product.id,
          },
        })

        if (!stock) {
          stock = new Stock()
        }

        stock.product = product

        const oldExistence = stock.existence || 0
        const oldAvailable = stock.available || 0
        stock.existence = oldExistence + quantity
        stock.available = oldAvailable + quantity

        stocks.push(stock)

        const movement = new Movement()
        movement.description =
          `Ingreso del producto ${product.name} por proveedor, código de factura de ingreso: ` +
          entryInvoice.code
        movement.quantity = element.quantity
        movement.stock = stock
        movement.user = user
        movement.movementDate = new Date()
        movements.push(movement)
      }

      if (!(await queryRunner.manager.save(productsArr))) {
        await queryRunner.rollbackTransaction()
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al crear los productos.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      if (!(await queryRunner.manager.save(entryInvoiceProducts))) {
        await queryRunner.rollbackTransaction()
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al crear los productos de la factura de entrada.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      if (!(await queryRunner.manager.save(stocks))) {
        await queryRunner.rollbackTransaction()
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al crear los inventarios.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      if (!(await queryRunner.manager.save(movements))) {
        await queryRunner.rollbackTransaction()
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al crear los movimientos.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      await queryRunner.commitTransaction()

      return res.status(StatusCodes.OK).send({
        message: "Se ha creado la entrada de inventario.",
        code: StatusCodes.OK,
        data: entryInvoice,
      })
    } catch (error) {
      console.log(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async listEntries(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { search } = req.query

      const query = EntryInvoice.createQueryBuilder("entryInvoice")
        .leftJoinAndSelect(
          "entryInvoice.entryInvoiceProduct",
          "entryInvoiceProduct"
        )
        .leftJoinAndSelect("entryInvoiceProduct.product", "product")
        .leftJoinAndSelect("entryInvoiceProduct.returnProduct", "returnProduct")
        .leftJoinAndSelect("product.provider", "provider")
        .leftJoinAndSelect("provider.people", "people")
        .leftJoinAndSelect("product.productType", "productType")

      if (search) {
        query.where(
          "entryInvoice.code LIKE :search OR people.firstname LIKE :search OR people.lastname LIKE :search OR productType.name LIKE :search OR product.name LIKE :search",
          { search: `%${search}%` }
        )
      }

      const total = await query.getCount()
      const entries = await query
        .orderBy("entryInvoice.id", "DESC")
        .skip(limit * (page - 1))
        .take(limit)
        .getMany()

      return res.status(StatusCodes.OK).send({
        message: "Lista de facturas de entrada.",
        code: StatusCodes.OK,
        data: entries,
        total,
      })
    } catch (error) {
      console.log(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async returnEntryProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      const { description } = req.body

      const token = getToken(req)

      const user = (
        await LoginHistory.findOne({
          where: { token },
        })
      ).user

      const entryInvoiceProduct = await EntryInvoiceProduct.findOne(id)

      if (!entryInvoiceProduct) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "La factura de entrada de los productos no existe.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      if (!description) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "La descripción de la devolución es obligatoria.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      const returnProduct = new ReturnProduct()
      returnProduct.description = description

      const stock = await Stock.findOne({
        where: {
          product: entryInvoiceProduct.product.id,
        },
      })

      if (!stock) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "El producto no tiene inventario.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      const oldExistence = stock.existence
      const oldAvailable = stock.available

      const newExistence = oldExistence - entryInvoiceProduct.quantity
      const newAvailable = oldAvailable - entryInvoiceProduct.quantity

      stock.existence = newExistence > 0 ? newExistence : 0
      stock.available = newAvailable > 0 ? newAvailable : 0

      const movement = new Movement()
      movement.description =
        `Devolución del producto ${entryInvoiceProduct.product.name} por proveedor, código de factura de entrada: ` +
        entryInvoiceProduct.entryInvoice.code
      movement.quantity = -entryInvoiceProduct.quantity
      movement.stock = stock
      movement.user = user
      movement.movementDate = new Date()

      const returnProductSaved = await returnProduct.save()
      const movementSaved = await movement.save()
      const stockSaved = await stock.save()
      entryInvoiceProduct.returnProduct = returnProductSaved
      const entryInvoiceProductSaved = await entryInvoiceProduct.save()

      if (!returnProductSaved || !movementSaved || !stockSaved) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al devolver el producto.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      return res.status(StatusCodes.OK).send({
        message: "Se ha devuelto el producto.",
        code: StatusCodes.OK,
        data: returnProductSaved,
      })
    } catch (error) {
      console.log(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async listReturnProducts(req: Request, res: Response) {
    try {
      let startDate: Date | null = null
      let endDate: Date | null = null

      if (req.query.startDate && req.query.endDate) {
        startDate = moment(String(req.query.startDate)).startOf("day").toDate()
        endDate = moment(String(req.query.endDate)).endOf("day").toDate()
      }

      const query = EntryInvoiceProduct.createQueryBuilder(
        "entryInvoiceProduct"
      )
        .leftJoinAndSelect("entryInvoiceProduct.returnProduct", "returnProduct")
        .leftJoinAndSelect("entryInvoiceProduct.product", "product")
        .leftJoinAndSelect("product.productType", "productType")
        .leftJoinAndSelect("product.provider", "provider")
        .leftJoinAndSelect("provider.people", "people")
        .where("entryInvoiceProduct.returnProduct IS NOT NULL")

      if (startDate && endDate) {
        query.where(
          "returnProduct.returnDate BETWEEN :startDate AND :endDate",
          {
            startDate,
            endDate,
          }
        )
      }

      const returnProducts = await query.getMany()

      const products = returnProducts.map((returnProduct) => ({
        product: returnProduct.product,
        quantity: returnProduct.quantity,
        reason: returnProduct.returnProduct.description,
      }))

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        products,
        message: "Lista de productos devueltos.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async listEntryProducts(req: Request, res: Response) {
    try {
      let startDate: Date | null = null
      let endDate: Date | null = null

      if (req.query.startDate && req.query.endDate) {
        startDate = moment(String(req.query.startDate)).startOf("day").toDate()
        endDate = moment(String(req.query.endDate)).endOf("day").toDate()
      }

      const query = EntryInvoiceProduct.createQueryBuilder(
        "entryInvoiceProduct"
      )
        .leftJoinAndSelect("entryInvoiceProduct.product", "product")
        .leftJoinAndSelect("entryInvoiceProduct.entryInvoice", "entryInvoice")
        .leftJoinAndSelect("product.productType", "productType")
        .leftJoinAndSelect("product.provider", "provider")
        .leftJoinAndSelect("provider.people", "people")

      if (startDate && endDate) {
        query.where("entryInvoice.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        })
      }

      const entryProducts = await query.getMany()

      const products = entryProducts.map((entryProduct) => ({
        product: entryProduct.product,
        quantity: entryProduct.quantity,
      }))

      const groupedProducts = products.reduce((acc, cur) => {
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
      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        groupedProducts,
        message: "Lista de productos ingresados.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
