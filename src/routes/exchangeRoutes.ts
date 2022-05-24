import { isAdmin, isLogged } from "./../middlewares/roleMiddlewares"
import { Router } from "express"
import { ExchangeController } from "../controllers/ExchangeController"

const exchangeController = new ExchangeController()

export const exchangeRoutes = Router()
  .get("", isAdmin, exchangeController.listExchanges)
  .post("", isAdmin, exchangeController.createExchange)
  .get("/today", isLogged, exchangeController.getTodayExchange)
  .get("/:id", isLogged, exchangeController.getExchange)
  .put("/:id", isAdmin, exchangeController.updateExchange)
  .get("/last", isLogged, exchangeController.getLastExchange)
