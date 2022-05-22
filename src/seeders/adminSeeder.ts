import bcrypt from "bcrypt"
import { User } from "./../entity/User"
import { Connection } from "typeorm"
import { userRoles } from "../helpers/userRoles"
import { People } from "../entity/People"
import { userStatuses } from "../helpers/userStatuses"

export const createAdmin = async (connection: Connection) => {
  let ADMIN = await User.findOne({
    where: { email: "admin@wencold.com", role: userRoles.ADMIN },
  })

  if (!ADMIN) {
    connection.transaction(async (conn) => {
      let people = new People()
      people.dni = "ADMIN"
      people.firstname = "Administrador"
      people.lastname = "Wencold"
      people.phone = "0251267589"
      people.address = "Calle 6 entre carrera 1 y avenida los horcones"

      let peopleSaved = await conn.save(people)

      let admin = new User()
      admin.people = peopleSaved
      admin.email = "admin@wencold.com"
      admin.role = userRoles.ADMIN
      admin.status = userStatuses.ACTIVE
      admin.password = await bcrypt.hash(
        "wencold1234",
        await bcrypt.genSalt(10)
      )

      let adminSaved = await conn.save(admin)
    })
    console.log(`ADMIN_USER: admin@wencold.com PASSWORD: wencold1234`)
  }
}
