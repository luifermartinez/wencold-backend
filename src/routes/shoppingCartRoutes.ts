import { ShoppingCartController } from "./../controllers/ShoppingCartController"
import { Router } from "express"
import { isLogged } from "../middlewares/roleMiddlewares"

const shoppingCartController = new ShoppingCartController()

export const shoppingCartRoutes = Router()
  .get("", isLogged, shoppingCartController.getMyProductsSaved)
  .post("", isLogged, shoppingCartController.addToCart)
