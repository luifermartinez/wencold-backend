import { Provider } from './../entity/Provider';
import { getConnection } from 'typeorm';
import { People } from './../entity/People';
import { Request, Response } from 'express';
import { paginate } from 'typeorm-pagination/dist/helpers/pagination';

export class ProviderController {
    async createProvider(req: Request, res: Response) {
        const { dni, firstname, lastname, phone, address } = req.body;

        if (!dni || !firstname || !lastname) return res.status(400).send({ message: 'Petición inválida, el DNI, el nombre y el apellido son requeridos.' });

        if (String(dni).length < 7) return res.status(400).send({ message: 'Petición inválida, el DNI debe tener al menos 7 carácteres.' });
        if (address && String(address).length < 10) return res.status(400).send({ message: 'Petición inválida, la dirección debe tener al menos 10 carácteres.' });

        try {
            getConnection().transaction(async conn => {
                let people = new People();
                people.dni = dni;
                people.firstname = firstname;
                people.lastname = lastname;
                address && (people.address = address);
                phone && (people.phone = phone);

                let peopleSaved = await conn.save(people);

                let provider = new Provider();
                provider.people = peopleSaved;

                let providerSaved = await conn.save(provider);
                return res.status(200).send({ message: 'Proveedor creado satisfactoriamente.' });
            })
        } catch (error) {
            return res.status(500).send({ message: 'Error de servidor.', data: error });
        }
    }

    async listProviders(req: Request, res: Response) {
        try {
            const page: number = parseInt(`${req.query.page}`) || 1;
            const limit: number = parseInt(`${req.query.limit}`) || 10;

            const { search } = req.query;

            let query = Provider.createQueryBuilder('provider').leftJoinAndSelect('provider.people', 'people');

            search && (query = query.where('people.firstname LIKE :firstname', { firstname: `%${search}%` }));

            const providers = await paginate(query, page, limit);
            if (!!!providers) return res.status(400).send({ data: null, message: 'Error de consulta' });
            return res.status(200).send({ ...providers });

        } catch (error) {
            return res.status(500).send({ message: 'Error de servidor.', data: error });
        }
    }

    async showProvider(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).send({ message: 'Petición inválida.' });

            let provider = await Provider.findOne({ where: { id: id }, withDeleted: true });
            if (!provider) return res.status(404).send({ message: 'Proveedor no encontrado.' });

            return res.status(200).send({ data: provider });
        } catch (error) {
            return res.status(500).send({ message: 'Error de servidor.', data: error });
        }
    }
}