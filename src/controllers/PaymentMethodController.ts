import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { PaymentMethod } from "../entity/PaymentMethod"
export class PaymentMethodController {
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const page: number = parseInt(`${req.query.page}`) || 1
      const limit: number = parseInt(`${req.query.limit}`) || 10

      const { search, status } = req.query

      const query =
        PaymentMethod.createQueryBuilder("paymentMethod").withDeleted()

      if (search) {
        query.where(
          "paymentMethod.name LIKE :search OR paymentMethod.ownerName LIKE :search OR paymentMethod.dni LIKE :search OR paymentMethod.email LIKE :search OR paymentMethod.phoneNumber LIKE :search OR paymentMethod.bankName LIKE :search OR paymentMethod.accountNumber LIKE :search",
          { search: `%${search}%` }
        )
      }

      if (status === "0") {
        query.andWhere("paymentMethod.deletedAt IS NOT NULL")
      }

      if (status === "1") {
        query.andWhere("paymentMethod.deletedAt IS NULL")
      }

      const paymentMethods = await query
        .orderBy("paymentMethod.id", "DESC")
        .skip(limit * (page - 1))
        .take(limit)
        .getMany()

      const total = await query.getCount()

      return res.status(StatusCodes.OK).send({
        data: paymentMethods,
        total,
        message: "Metodos de pago listados.",
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async getPaymentMethod(req: Request, res: Response) {
    try {
      const { id } = req.params

      const paymentMethod = await PaymentMethod.findOne({
        where: { id },
        withDeleted: true,
      })

      if (!paymentMethod) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Metodo de pago no encontrado.",
          code: StatusCodes.NOT_FOUND,
        })
      }

      return res.status(StatusCodes.OK).send({
        data: paymentMethod,
        message: "Metodo de pago encontrado.",
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async createPaymentMethod(req: Request, res: Response) {
    try {
      const {
        name,
        ownerName,
        dni,
        email,
        phoneNumber,
        bankName,
        accountNumber,
      } = req.body

      const paymentMethod = new PaymentMethod()

      paymentMethod.name = name
      ownerName && (paymentMethod.ownerName = ownerName)
      dni && (paymentMethod.dni = dni)
      email && (paymentMethod.email = email)
      phoneNumber && (paymentMethod.phoneNumber = phoneNumber)
      bankName && (paymentMethod.bankName = bankName)
      accountNumber && (paymentMethod.accountNumber = accountNumber)

      let pmsaved = await paymentMethod.save()

      if (!pmsaved) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al crear el metodo de pago.",
          code: StatusCodes.BAD_REQUEST,
        })
      }

      return res.status(StatusCodes.OK).send({
        data: paymentMethod,
        message: "Metodo de pago creado.",
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updatePaymentMethod(req: Request, res: Response) {
    try {
      const { id } = req.params

      const paymentMethod = await PaymentMethod.findOne({
        where: { id },
        withDeleted: true,
      })

      if (!paymentMethod) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Metodo de pago no encontrado.",
          code: StatusCodes.NOT_FOUND,
        })
      }

      const {
        name,
        ownerName,
        dni,
        email,
        phoneNumber,
        bankName,
        accountNumber,
      } = req.body

      name && (paymentMethod.name = name)
      ownerName && (paymentMethod.ownerName = ownerName)
      dni && (paymentMethod.dni = dni)
      email && (paymentMethod.email = email)
      phoneNumber && (paymentMethod.phoneNumber = phoneNumber)
      bankName && (paymentMethod.bankName = bankName)
      accountNumber && (paymentMethod.accountNumber = accountNumber)

      let pmupdated = await paymentMethod.save()

      if (!pmupdated) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al actualizar el metodo de pago.",
          code: StatusCodes.BAD_REQUEST,
        })
      }

      return res.status(StatusCodes.OK).send({
        data: paymentMethod,
        message: "Metodo de pago actualizado.",
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async togglePaymentMethod(req: Request, res: Response) {
    try {
      const { id } = req.params

      const paymentMethod = await PaymentMethod.findOne({
        where: { id },
        withDeleted: true,
      })

      if (!paymentMethod) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Metodo de pago no encontrado.",
          code: StatusCodes.NOT_FOUND,
        })
      }

      if (paymentMethod.deletedAt) {
        paymentMethod.deletedAt = null
      } else {
        paymentMethod.deletedAt = new Date()
      }

      let pmupdated = await paymentMethod.save()

      if (!pmupdated) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Error al actualizar el metodo de pago.",
          code: StatusCodes.BAD_REQUEST,
        })
      }

      return res.status(StatusCodes.OK).send({
        data: paymentMethod,
        message: "Metodo de pago actualizado.",
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error de servidor",
        data: error,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
