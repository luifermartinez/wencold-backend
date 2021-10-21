import { ProductType } from './../entity/ProductType';
import { Response, Request } from 'express';
import { paginate } from 'typeorm-pagination/dist/helpers/pagination';
export class ProductTypeController {

    async createProductType(req: Request, res: Response) {
        const { name, description } = req.body;

        try {
            if (!name || !description) return res.status(400).send({ message: 'Petición inválida, nombre y descripción requeridos.' });

            let productType = new ProductType();
            productType.name = name;
            productType.description = description;

            let ptSaved = await productType.save();
            if (!ptSaved) return res.status(500).send({ message: 'Ha ocurrido un error al intentar guardar el tipo de producto.' });

            return res.status(200).send({ message: 'Tipo de producto creado satisfactoriamente.' });
        } catch (error) {
            return res.status(500).send({ message: 'Error de servidor.', data: error });
        }
    }

    async listProductTypes(req: Request, res: Response) {
        try {
            const page: number = parseInt(`${req.query.page}`) || 1;
            const limit: number = parseInt(`${req.query.limit}`) || 10;

            const { search } = req.query;

            let query = ProductType.createQueryBuilder('productType')

            search && (query = query.where('productType.name LIKE :name', { name: `%${search}%` }));

            const productTypes = await paginate(query, page, limit);
            if (!!!productTypes) return res.status(400).send({ data: null, message: 'Error de consulta' });
            return res.status(200).send({ ...productTypes });
        } catch (error) {
            return res.status(500).send({ message: 'Error de servidor.', data: error });
        }
    }

}