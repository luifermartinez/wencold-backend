import { EntryInvoiceController } from "./../controllers/EntryInvoiceController"
import {
  isAdmin,
  isAdminOrManager,
  isManager,
} from "./../middlewares/roleMiddlewares"
import { Router } from "express"

const entryInvoiceController = new EntryInvoiceController()

export const entryInvoiceRoutes = Router()
  .post("", isManager, entryInvoiceController.create)
  .get("", isAdminOrManager, entryInvoiceController.listEntries)
  .get("/returned-products", isAdmin, entryInvoiceController.listReturnProducts)
  .get("/products-entry", isAdmin, entryInvoiceController.listEntryProducts)
  .put("/:id", isManager, entryInvoiceController.returnEntryProduct)
