import { StatusCodes } from "http-status-codes"
import { ProductType } from "./../entity/ProductType"
import { Response, Request } from "express"
import { paginate } from "typeorm-pagination/dist/helpers/pagination"
export class ProductTypeController {
  async createProductType(req: Request, res: Response) {
    const { name, description } = req.body

    try {
      if (!name || !description)
        return res.status(400).send({
          message: "Petición inválida, nombre y descripción requeridos.",
        })

      let productType = new ProductType()
      productType.name = name
      productType.description = description

      let ptSaved = await productType.save()
      if (!ptSaved)
        return res.status(500).send({
          message:
            "Ha ocurrido un error al intentar guardar el tipo de producto.",
        })

      return res.status(200).send({
        message: "Tipo de producto creado satisfactoriamente.",
        code: StatusCodes.CREATED,
        data: ptSaved,
      })
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error de servidor.", data: error })
    }
  }

  async updateProductType(req: Request, res: Response) {
    try {
      const { id } = req.params

      const { name, description } = req.body

      if (!id || !name || !description) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Petición inválida.",
          code: StatusCodes.BAD_REQUEST,
          data: null,
        })
      }

      const productType = await ProductType.findOne(id)
      if (!productType) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "El tipo de producto no existe.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })
      }

      productType.name = name
      productType.description = description

      const ptSaved = await productType.save()
      if (!ptSaved) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Error al actualizar el tipo de producto.",
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          data: null,
        })
      }

      return res.status(StatusCodes.OK).send({
        message: "Tipo de producto actualizado satisfactoriamente.",
        code: StatusCodes.OK,
        data: ptSaved,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async listProductTypes(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { search } = req.query

      let query = ProductType.createQueryBuilder("productType")

      search &&
        (query = query.where("productType.name LIKE :name", {
          name: `%${search}%`,
        }))

      const productTypes = await query
        .skip(limit * (page - 1))
        .take(limit)
        .getMany()

      const count = await query.getCount()

      if (!!!productTypes)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          data: null,
          message: "Error de consulta",
          code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      return res
        .status(StatusCodes.OK)
        .send({ data: productTypes, total: count, code: StatusCodes.OK })
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error de servidor.", data: error })
    }
  }

  async getProductType(req: Request, res: Response) {
    try {
      const { id } = req.params

      const productType = await ProductType.findOne(id)
      if (!productType)
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "El tipo de producto no existe.",
          code: StatusCodes.NOT_FOUND,
          data: null,
        })

      return res
        .status(StatusCodes.OK)
        .send({
          message: "Tipo de producto encontrado.",
          code: StatusCodes.OK,
          data: productType,
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
