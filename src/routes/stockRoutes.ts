import {
  isAdminOrManager,
  isLogged,
  isManager,
} from "./../middlewares/roleMiddlewares"
import { Router } from "express"
import { StockController } from "../controllers/StockController"

const stockController = new StockController()

export const stockRoutes = Router()
  .get("", isAdminOrManager, stockController.getStock)
  .post("/:id/image", isManager, stockController.uploadProductImage)
  .delete("/:id/image", isManager, stockController.deleteImageProduct)
  .get("/:id", isLogged, stockController.getProduct)
  .put("/:id", isManager, stockController.updateProduct)
