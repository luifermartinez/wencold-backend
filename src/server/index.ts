import { createConnection } from 'typeorm';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import { Response, Request } from "express";
import { pagination } from 'typeorm-pagination';
import { authRoutes } from '../routes/authRoutes';

export class Server {
    app: express.Express;
    port: any;
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
        this.app.use(morgan('dev'));
        this.app.use(morgan('dev'));
        this.app.use(pagination);
        this.app.set('trust proxy', true);
    }

    routes() {
        this.app.use('/api/auth', authRoutes);
    }

    start() {
        createConnection()
            .then(connecction => {
                this.app.listen(this.port, () => console.log(`Backend Running in port ${this.port}`))
            })
            .catch(error => console.log(error))
    }
}