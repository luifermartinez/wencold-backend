import bcrypt from "bcrypt"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import moment from "moment"
import { People } from "../entity/People"
import { User } from "../entity/User"

export class UsersController {
  async listUsers(req: Request, res: Response) {
    try {
      const { page, limit, search, role, status } = req.query

      const pageNumber = page ? Number(page) : 1
      const limitNumber = limit ? Number(limit) : 10

      const query = User.createQueryBuilder("user")
        .leftJoinAndSelect("user.image", "image")
        .leftJoinAndSelect("user.people", "people")

      if (search) {
        query.where(
          "user.email LIKE :search OR people.firstname LIKE :search OR people.lastname LIKE :search OR people.phone LIKE :search OR people.dni LIKE :search",
          { search: `%${search}%` }
        )
      }

      if (role) {
        query.andWhere("user.role = :role", { role })
      }

      if (status) {
        query.andWhere("user.status = :status", { status })
      }

      const users = await query
        .skip((pageNumber - 1) * limitNumber)
        .take(limitNumber)
        .getMany()

      const count = await query.getCount()

      return res.status(StatusCodes.OK).send({
        data: users,
        total: count,
        page: pageNumber,
        limit: limitNumber,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status, bannedReason } = req.body

      const user = await User.findOne({
        where: { id },
      })

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Usuario no encontrado.",
        })
      }

      if (user.id === 1) {
        return res.status(StatusCodes.FORBIDDEN).send({
          code: StatusCodes.FORBIDDEN,
          message: "No puedes cambiar el estado del usuario admin.",
        })
      }

      if (user.status === status) {
        return res.status(StatusCodes.OK).send({
          code: StatusCodes.OK,
          message: "El estado del usuario no ha cambiado.",
        })
      }

      if (status === "banned") {
        user.bannedReason = bannedReason
      }

      if (status === "active") {
        user.bannedReason = null
      }

      user.status = status
      await user.save()

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        message: "Estado del usuario actualizado satisfactoriamente.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params

      const user = await User.findOne({
        where: { id },
      })

      if (!user)
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Usuario no encontrado.",
        })

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: user,
        message: "Datos del usuario encontrados.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { email, dni, firstname, lastname, phone, address, role } = req.body

      const emailLower = email.toLowerCase()

      const userEmail = await User.findOne({
        where: { email: emailLower },
      })

      if (userEmail) {
        return res.status(StatusCodes.CONFLICT).send({
          code: StatusCodes.CONFLICT,
          message: "El email ya está registrado.",
        })
      }

      const userDni = await User.findOne({
        relations: ["people"],
        where: {
          people: {
            dni,
          },
        },
      })

      if (userDni) {
        return res.status(StatusCodes.CONFLICT).send({
          code: StatusCodes.CONFLICT,
          message: "El dni ya está registrado.",
        })
      }

      const newPeople = new People()
      newPeople.dni = dni
      newPeople.firstname = firstname
      newPeople.lastname = lastname
      address && (newPeople.address = address)
      phone && (newPeople.address = phone)

      const peopleSaved = await newPeople.save()
      if (!peopleSaved) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error al guardar la persona.",
        })
      }

      const newUser = new User()
      newUser.email = emailLower
      newUser.password = await bcrypt.hash(dni, await bcrypt.genSalt(10))
      newUser.role = role
      newUser.people = peopleSaved

      const userSaved = await newUser.save()
      if (!userSaved) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error al guardar el usuario.",
        })
      }

      return res.status(StatusCodes.CREATED).send({
        code: StatusCodes.CREATED,
        data: newUser,
        message: "Usuario creado satisfactoriamente.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async usersRegistered(req: Request, res: Response) {
    try {
      let startDate: Date | null = null
      let endDate: Date | null = null

      if (req.query.startDate && req.query.endDate) {
        startDate = moment(String(req.query.startDate)).startOf("day").toDate()
        endDate = moment(String(req.query.endDate)).endOf("day").toDate()
      }

      const query = User.createQueryBuilder("user").leftJoinAndSelect(
        "user.people",
        "people"
      )

      if (startDate && endDate) {
        query.where("user.createdAt BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        })
      }

      const users = await query.getMany()

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: users,
        message: "Usuarios encontrados.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor.",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
