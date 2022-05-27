import { PaymentMethodController } from "./../controllers/PaymentMethodController"
import { isAdmin, isLogged } from "./../middlewares/roleMiddlewares"
import { Router } from "express"

const paymentMethodController = new PaymentMethodController()

export const paymentMethodRoutes = Router()
  .get("", isLogged, paymentMethodController.getPaymentMethods)
  .post("", isAdmin, paymentMethodController.createPaymentMethod)
  .get("/:id", isLogged, paymentMethodController.getPaymentMethod)
  .put("/:id", isAdmin, paymentMethodController.updatePaymentMethod)
  .put("/:id/toggle", isAdmin, paymentMethodController.togglePaymentMethod)
