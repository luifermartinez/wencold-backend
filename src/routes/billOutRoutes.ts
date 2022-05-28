import { BillOutController } from "./../controllers/BillOutController"
import { Router } from "express"
import { isLogged } from "../middlewares/roleMiddlewares"

const billOutController = new BillOutController()

export const billOutRoutes = Router()
  .get("", isLogged, billOutController.getBillOuts)
  .get("/:id", isLogged, billOutController.getBillOut)
