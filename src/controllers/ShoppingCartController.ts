import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { LoginHistory } from "../entity/LoginHistory"
import { ShoppingCart } from "../entity/ShoppingCart"
import { Stock } from "../entity/Stock"
import { User } from "../entity/User"
import { getToken } from "../helpers/getToken"

export class ShoppingCartController {
  async getMyProductsSaved(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const carts = await ShoppingCart.find({
        where: { user: userLogin.user },
      })

      return res.status(StatusCodes.OK).send({
        message: "Productos encontrados.",
        data: carts,
        code: StatusCodes.OK,
      })
    } catch (error) {
      console.log(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error al obtener los productos.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async addToCart(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const { stock, quantity } = req.body

      const stockExist = await Stock.findOne({
        where: { id: stock },
      })

      if (!stockExist) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Producto no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      const cartProduct = await ShoppingCart.findOne({
        where: { user: userLogin.user.id, product: stockExist.product.id },
      })

      if (cartProduct) {
        if (cartProduct.quantity + quantity > stockExist.available) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "No hay suficiente stock.",
            data: null,
            code: StatusCodes.BAD_REQUEST,
          })
        }

        const newQuantity = cartProduct.quantity + quantity

        cartProduct.quantity = newQuantity

        await cartProduct.save()

        return res.status(StatusCodes.OK).send({
          message: "Nueva cantidad agregada al carrito.",
          data: cartProduct,
          code: StatusCodes.OK,
        })
      }

      if (stockExist.available < quantity) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No hay suficiente stock.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      const cart = new ShoppingCart()
      cart.user = userLogin.user
      cart.product = stockExist.product
      cart.quantity = quantity

      await cart.save()

      return res.status(StatusCodes.OK).send({
        message: "Producto agregado al carrito.",
        data: cart,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error al agregar el producto al carrito.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { quantity } = req.body

      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const cartProduct = await ShoppingCart.findOne({
        where: { id, user: userLogin.user.id },
      })

      if (!cartProduct) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Producto no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      const stock = await Stock.findOne({
        where: { product: cartProduct.product.id },
      })

      if (quantity > stock.available) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "No hay suficiente stock.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      cartProduct.quantity = quantity

      await cartProduct.save()

      return res.status(StatusCodes.OK).send({
        message: "Producto actualizado.",
        data: cartProduct,
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
