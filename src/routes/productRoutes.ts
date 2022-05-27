import { ProductController } from "./../controllers/ProductController"
import { isManager } from "./../middlewares/roleMiddlewares"
import { Router } from "express"
import { ProductTypeController } from "../controllers/ProductTypeController"
import { isAdmin, isLogged } from "../middlewares/roleMiddlewares"

const type = new ProductTypeController()
const productController = new ProductController()

export const productRoutes = Router()
  .post("/productTypes", isManager, type.createProductType)
  .get("/productTypes", isLogged, type.listProductTypes)
  .get("/productTypes/:id", isLogged, type.getProductType)
  .put("/productTypes/:id", isManager, type.updateProductType)
  .get("/:id", isLogged, productController.getProduct)
  .get("", isLogged, productController.index)
