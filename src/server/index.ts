import { apiRoutes } from './../routes/apiRoutes';
import { People } from './../entity/People';
import { User } from './../entity/User';
import { createConnection, getConnection } from 'typeorm';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import { pagination } from 'typeorm-pagination';
import DeviceDetector from 'node-device-detector';
import { userRoles } from '../helpers/userRoles';
import { userStatuses } from '../helpers/userStatuses';
import bcrypt from 'bcrypt';


export class Server {
    app: express.Express;
    port: any;
    deviceDetector = new DeviceDetector();
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8000;

        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(this.middlewareDetect);
        this.app.use(morgan('dev'));
        this.app.use(morgan('dev'));
        this.app.use(pagination);
        this.app.set('trust proxy', true);
    }

    middlewareDetect = (req: any, res: any, next: any) => {
        const useragent = req.headers['user-agent'];
        req.useragent = useragent;
        req.device = this.deviceDetector.detect(useragent);
        req.bot = this.deviceDetector.parseBot(useragent);
        next();
    };


    routes() {
        this.app.use('/api', apiRoutes);
    }

    start() {
        createConnection()
            .then(async connecction => {

                let ADMIN = await User.findOne({ where: { email: 'admin@wencold.com', role: userRoles.ADMIN } });

                if (!ADMIN) {

                    getConnection().transaction(async conn => {
                        let people = new People();
                        people.dni = 'ADMIN';
                        people.firstname = 'Administrador';
                        people.lastname = 'Wencold';
                        people.phone = '0251267589';
                        people.address = 'Calle 6 entre carrera 1 y avenida los horcones';

                        let peopleSaved = await conn.save(people);

                        let admin = new User();
                        admin.people = peopleSaved;
                        admin.email = 'admin@wencold.com';
                        admin.role = userRoles.ADMIN;
                        admin.status = userStatuses.ACTIVE;
                        admin.password = await bcrypt.hash('wencold1234', await bcrypt.genSalt(10));

                        let adminSaved = await conn.save(admin);

                    })
                    console.log(`ADMIN_USER: admin@wencold.com PASSWORD: wencold1234`)

                }

                this.app.listen(this.port, () => console.log(`Backend Running in port ${this.port}`))
            })
            .catch(error => console.log(error))
    }
}