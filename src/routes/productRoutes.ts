import { Router } from "express";
import { ProductTypeController } from '../controllers/ProductTypeController';
import { isAdmin, isLogged } from '../middlewares/roleMiddlewares';


const type = new ProductTypeController();

export const productRoutes = Router()
    .post('/productTypes', isAdmin, type.createProductType)
    .get('/productTypes', isLogged, type.listProductTypes)
