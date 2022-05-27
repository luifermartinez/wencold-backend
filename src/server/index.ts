import { apiRoutes } from "./../routes/apiRoutes"
import { createConnection } from "typeorm"
import express from "express"
import morgan from "morgan"
import cors from "cors"
import { pagination } from "typeorm-pagination"
import DeviceDetector from "node-device-detector"
import { createAdmin } from "../seeders/adminSeeder"
import { createFirstExchange } from "../seeders/exchangeSeeder"
import fileUpload from "express-fileupload"
import bodyParser from "body-parser"

export class Server {
  app: express.Express
  port: any
  deviceDetector = new DeviceDetector()
  constructor() {
    this.app = express()
    this.port = process.env.PORT || 3150

    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(cors())
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(this.middlewareDetect)
    this.app.use(morgan("dev"))
    this.app.use(pagination)
    this.app.set("trust proxy", true)
    this.app.use(express.static("public"))
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      })
    )
  }

  middlewareDetect = (req: any, res: any, next: any) => {
    const useragent = req.headers["user-agent"]
    req.useragent = useragent
    req.device = this.deviceDetector.detect(useragent)
    req.bot = this.deviceDetector.parseBot(useragent)
    next()
  }

  routes() {
    this.app.use("/api", apiRoutes)
  }

  start() {
    createConnection()
      .then(async (connecction) => {
        await createAdmin(connecction)
        await createFirstExchange(connecction)

        this.app.listen(this.port, () =>
          console.log(`Backend Running in port ${this.port}`)
        )
      })
      .catch((error) => console.log(error))
  }
}
