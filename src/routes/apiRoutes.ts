import { exchangeRoutes } from "./exchangeRoutes"
import { providerRoutes } from "./providerRoutes"
import { productRoutes } from "./productRoutes"
import { authRoutes } from "./authRoutes"
import { Router } from "express"

export const apiRoutes = Router()
  .use("/auth", authRoutes)
  .use("/product", productRoutes)
  .use("/provider", providerRoutes)
  .use("/exchange", exchangeRoutes)
