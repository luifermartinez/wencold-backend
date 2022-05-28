import { isAdmin } from "./../middlewares/roleMiddlewares"
import { PaymentController } from "./../controllers/PaymentController"
import { Router } from "express"
import { isLogged } from "../middlewares/roleMiddlewares"

const paymentController = new PaymentController()

export const paymentRoutes = Router()
  .get("", isLogged, paymentController.getMyPayments)
  .get("/:id", isLogged, paymentController.getMyPayment)
  .put("/:id", isLogged, paymentController.cancelPayment)
  .put("/:id/status", isAdmin, paymentController.updatePayment)
  .post("", isLogged, paymentController.makePayment)
  .post("/billOut", isLogged, paymentController.makeBillOut)
