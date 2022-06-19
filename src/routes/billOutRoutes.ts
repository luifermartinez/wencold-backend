import { isAdmin, isManager } from "./../middlewares/roleMiddlewares"
import { BillOutController } from "./../controllers/BillOutController"
import { Router } from "express"
import { isLogged } from "../middlewares/roleMiddlewares"

const billOutController = new BillOutController()

export const billOutRoutes = Router()
  .get("", isLogged, billOutController.getBillOuts)
  .get("/find", isManager, billOutController.findCustomer)
  .get("/most-sold", isAdmin, billOutController.getMostSoldProducts)
  .get("/less-sold", isAdmin, billOutController.getLessSoldProducts)
  .get("/:id", isLogged, billOutController.getBillOut)
  .post("", isManager, billOutController.makeBillOut)
