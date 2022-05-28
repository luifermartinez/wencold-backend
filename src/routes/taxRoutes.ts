import { isAdmin } from "./../middlewares/roleMiddlewares"
import { TaxController } from "./../controllers/TaxController"
import { Router } from "express"
import { isLogged } from "../middlewares/roleMiddlewares"

const taxController = new TaxController()

export const taxRoutes = Router()
  .get("", isLogged, taxController.getTax)
  .put("", isAdmin, taxController.updateTax)
