import { billOutRoutes } from "./billOutRoutes"
import { paymentRoutes } from "./paymentRoutes"
import { taxRoutes } from "./taxRoutes"
import { profileRoutes } from "./profileRoutes"
import { StockController } from "./../controllers/StockController"
import { entryInvoiceRoutes } from "./entryInvoiceRoutes"
import { usersRoutes } from "./usersRoutes"
import { exchangeRoutes } from "./exchangeRoutes"
import { providerRoutes } from "./providerRoutes"
import { productRoutes } from "./productRoutes"
import { authRoutes } from "./authRoutes"
import { Router } from "express"
import { movementsRoutes } from "./movementsRoutes"
import { stockRoutes } from "./stockRoutes"
import { paymentMethodRoutes } from "./paymentMethodRoutes"
import { shoppingCartRoutes } from "./shoppingCartRoutes"

const stockController = new StockController()

export const apiRoutes = Router()
  .use("/auth", authRoutes)
  .use("/product", productRoutes)
  .use("/provider", providerRoutes)
  .use("/exchange", exchangeRoutes)
  .use("/users", usersRoutes)
  .use("/entry", entryInvoiceRoutes)
  .use("/movements", movementsRoutes)
  .use("/stock", stockRoutes)
  .use("/profile", profileRoutes)
  .use("/payment-methods", paymentMethodRoutes)
  .use("/payment", paymentRoutes)
  .use("/shopping-cart", shoppingCartRoutes)
  .use("/billout", billOutRoutes)
  .use("/tax", taxRoutes)
  .get("/image", stockController.getImage)
