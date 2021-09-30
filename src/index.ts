import "reflect-metadata";
import { Server } from "./server";
import d from 'dotenv';
d.config();

const server = new Server();

server.start();