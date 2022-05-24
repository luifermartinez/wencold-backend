import { Provider } from "./../entity/Provider"
import { getConnection } from "typeorm"
import { People } from "./../entity/People"
import { Request, Response } from "express"
import { paginate } from "typeorm-pagination/dist/helpers/pagination"
import { StatusCodes } from "http-status-codes"

export class ProviderController {
  async createProvider(req: Request, res: Response) {
    const { dni, firstname, lastname, phone, address } = req.body

    if (!dni || !firstname || !lastname)
      return res.status(400).send({
        message:
          "Petición inválida, el DNI, el nombre y el apellido son requeridos.",
      })

    if (String(dni).length < 7)
      return res.status(400).send({
        message: "Petición inválida, el DNI debe tener al menos 7 carácteres.",
      })
    if (address && String(address).length < 10)
      return res.status(400).send({
        message:
          "Petición inválida, la dirección debe tener al menos 10 carácteres.",
      })

    try {
      getConnection().transaction(async (conn) => {
        let people = new People()
        people.dni = dni
        people.firstname = firstname
        people.lastname = lastname
        address && (people.address = address)
        phone && (people.phone = phone)

        let peopleSaved = await conn.save(people)

        let provider = new Provider()
        provider.people = peopleSaved

        await conn.save(provider)
        return res.status(200).send({
          message: "Proveedor creado satisfactoriamente.",
          code: StatusCodes.CREATED,
        })
      })
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error de servidor.", data: error })
    }
  }

  async listProviders(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { search, status } = req.query

      let query = Provider.createQueryBuilder("provider")
        .leftJoinAndSelect("provider.people", "people")
        .withDeleted()

      search &&
        (query = query.where(
          "people.firstname LIKE :search OR people.lastname LIKE :search ",
          { search: `%${search}%` }
        ))

      if (status === "active") {
        query.where("provider.deletedAt IS NULL")
      }

      if (status === "deleted") {
        query.where("provider.deletedAt IS NOT NULL")
      }

      const providers = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany()

      const total = await query.getCount()

      if (!!!providers)
        return res
          .status(400)
          .send({ data: null, message: "Error de consulta" })
      return res
        .status(200)
        .send({ code: StatusCodes.OK, data: providers, total })
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error de servidor.", data: error })
    }
  }

  async showProvider(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) return res.status(400).send({ message: "Petición inválida." })

      let provider = await Provider.findOne({
        where: { id: id },
        withDeleted: true,
      })
      if (!provider)
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Proveedor no encontrado.",
          code: StatusCodes.NOT_FOUND,
        })

      return res.status(200).send({ data: provider, code: StatusCodes.OK })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updateProvider(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) return res.status(400).send({ message: "Petición inválida." })

      let provider = await Provider.findOne({
        where: { id: id },
        withDeleted: true,
      })
      if (!provider)
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Proveedor no encontrado.",
          code: StatusCodes.NOT_FOUND,
        })

      const { firstname, lastname, phone, address } = req.body

      if (!firstname || !lastname)
        return res.status(400).send({
          message:
            "Petición inválida, el DNI, el nombre y el apellido son requeridos.",
        })

      if (address && String(address).length < 10)
        return res.status(400).send({
          message:
            "Petición inválida, la dirección debe tener al menos 10 carácteres.",
        })

      provider.people.firstname = firstname
      provider.people.lastname = lastname
      address && (provider.people.address = address)
      phone && (provider.people.phone = phone)

      await provider.people.save()
      await provider.save()
      return res.status(200).send({
        message: "Proveedor actualizado.",
        data: provider,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Error de servidor.", data: error })
    }
  }

  async toggleProvider(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "Petición inválida." })

      let provider = await Provider.findOne({
        where: { id: id },
        withDeleted: true,
      })
      if (!provider)
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Proveedor no encontrado.",
          code: StatusCodes.NOT_FOUND,
        })

      provider.deletedAt = provider.deletedAt ? null : new Date()

      await provider.save()
      return res.status(200).send({
        message: "Proveedor actualizado.",
        data: provider,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Error de servidor.", data: error })
    }
  }
}
