import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { Product } from "../entity/Product"
import { Stock } from "../entity/Stock"

export class ProductController {
  async index(req: Request, res: Response) {
    const page: number = parseInt(`${req.query.page}`) || 1
    const limit: number = parseInt(`${req.query.limit}`) || 10

    const { search, productType } = req.query

    const query = Stock.createQueryBuilder("stock")
      .leftJoinAndSelect("stock.product", "product")
      .leftJoinAndSelect("product.productType", "productType")
      .leftJoinAndSelect("product.productImage", "productImage")
      .leftJoinAndSelect("productImage.image", "image")

    if (search) {
      query.where("product.name LIKE :search", { search: `%${search}%` })
    }

    if (productType) {
      query.andWhere("productType.id = :productType", { productType })
    }

    const [products, total] = await query
      .orderBy("product.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return res.status(StatusCodes.OK).send({
      data: products,
      total,
      code: StatusCodes.OK,
      message: "Productos listados",
    })
  }

  async getProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      const stock = await Stock.findOne(id)

      if (!stock) {
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Producto no encontrado",
        })
      }

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: stock,
        message: "Producto encontrado",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error al obtener el producto",
        error: error,
      })
    }
  }
}
