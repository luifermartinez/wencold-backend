import path from "path"
import fs from "fs"
import { ProductImage } from "./../entity/ProductImage"
import { Movement } from "./../entity/Movement"
import { Product } from "./../entity/Product"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { Stock } from "../entity/Stock"
import { getToken } from "../helpers/getToken"
import { LoginHistory } from "../entity/LoginHistory"
import { Image } from "../entity/Image"
import { uploadFile } from "../utils/uploadFile"

export class StockController {
  async getStock(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { search, sort, type } = req.query

      const order = type === "0" ? "DESC" : "ASC"
      const orderBy = sort ? String(sort) : "product.name"

      console.log(sort, type)

      const query = Stock.createQueryBuilder("stock")
        .leftJoinAndSelect("stock.product", "product")
        .leftJoinAndSelect("product.productType", "productType")
        .leftJoinAndSelect("product.provider", "provider")
        .leftJoinAndSelect("provider.people", "people")

      if (search) {
        query.where(
          "product.name LIKE :search OR people.firstname LIKE :search OR people.lastname LIKE :search OR people.dni LIKE :search OR productType.name LIKE :search",
          { search: `%${search}%` }
        )
      }

      if (order && orderBy) {
        query.orderBy(orderBy, order)
      }

      const stocks = await query
        .skip(limit * (page - 1))
        .take(limit)
        .getMany()

      const count = await query.getCount()

      return res.status(StatusCodes.OK).send({
        data: stocks,
        total: count,
        message: "Stock listados.",
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

  async getProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      const product = await Product.findOne(id)

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Producto no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      return res.status(StatusCodes.OK).send({
        message: "Producto encontrado.",
        data: product,
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

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      const { name, price, productType, provider, warrantyUpTo } = req.body

      const product = await Product.findOne(id)

      const token = getToken(req)

      const user = (
        await LoginHistory.findOne({
          where: { token },
        })
      ).user

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Producto no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      product.name = name
      product.price = price
      product.productType = productType
      product.provider = provider
      if (warrantyUpTo) {
        product.warrantyUpTo = warrantyUpTo
      }

      await product.save()

      const stock = await Stock.findOne({
        where: { product: product },
      })

      const movement = new Movement()
      movement.description = `Producto ${product.code} | ${product.name} actualizado.`
      movement.quantity = 0
      movement.user = user

      movement.stock = stock
      movement.movementDate = new Date()

      await movement.save()

      return res.status(StatusCodes.OK).send({
        message: "Producto actualizado.",
        data: product,
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

  async uploadProductImage(req: Request, res: Response) {
    try {
      const { id } = req.params
      const image = req.files.image

      const product = await Product.findOne(id)

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Producto no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      const newProductImage = new ProductImage()
      newProductImage.product = product

      await newProductImage.save()

      if (image) {
        let patho: any
        let imga: Image
        imga = new Image()

        patho = await uploadFile(
          req.files,
          "image",
          undefined,
          `product/${product.id}`
        )
        imga.path = patho
        const imageSaved = await Image.save(imga)
        newProductImage.image = imageSaved

        const productImageSaved = await newProductImage.save()
        return res.status(StatusCodes.OK).send({
          message: "Imagen subida.",
          data: productImageSaved,
          code: StatusCodes.OK,
        })
      } else {
        return res.status(400).send({
          code: 400,
          data: null,
          message: "No se ha enviado ninguna imagen",
        })
      }
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: error,
        data: null,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async getImage(req: Request, res: Response) {
    const { imagePath } = req.query

    if (!imagePath)
      return res
        .status(400)
        .send({ code: 400, data: null, message: "Petición inválida." })

    if (imagePath) {
      const pathImage = path.join(
        __dirname,
        "../../public",
        imagePath.toString()
      )
      if (fs.existsSync(pathImage)) {
        return res.sendFile(pathImage)
      } else {
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          data: null,
          message: "Imagen no encontrada.",
        })
      }
    } else {
      return res.status(StatusCodes.NOT_FOUND).send({
        code: StatusCodes.NOT_FOUND,
        data: null,
        message: "Imagen no encontrada.",
      })
    }
  }

  async deleteImageProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      const productImage = await ProductImage.findOne(id)

      if (!productImage) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Producto no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      const pathImage = path.join(
        __dirname,
        "../../public",
        productImage.image.path.toString()
      )

      if (fs.existsSync(pathImage)) {
        fs.unlinkSync(pathImage)
      }

      const image = await Image.findOne(productImage.image.id)
      await image.remove()

      await productImage.remove()

      return res.status(StatusCodes.OK).send({
        message: "Imagen eliminada.",
        data: null,
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
