import * as dotenv from 'dotenv';

dotenv.config()
import * as express from 'express'
import * as cors from 'cors'
import {AppDataSource} from "./database/datasource";
import {userRouter} from "./routes/user";
import {Server} from 'socket.io';
import * as http from "http";
import * as swaggerJsonFile from "./docs/swagger_output.json"
import * as basicAuth from 'express-basic-auth'
import {authRouter} from "./routes/auth";
import {initSocket} from "./utils/socket/initSocket";
import * as bodyParser from "body-parser"
import * as swStats from "swagger-stats";
import * as cron from 'node-cron';
import {carRouter} from "./routes/car";
import {entryRouter} from "./routes/entry";

export class Index {
    static jwtKey = process.env.JWT_SECRET;
    static app = express()
    static router = express.Router()
    static server = http.createServer(Index.app); // Créez un serveur HTTP à partir de votre application Express
    static io = new Server(Index.server, {cors: {origin: '*'}}); // Créez une instance de Socket.IO attachée à votre serveur HTTP

    static globalConfig() {
        Index.app.set('trust proxy', '127.0.0.1'); // Ready to trust you're nginx proxy :))
        Index.app.disable('x-powered-by');
        Index.app.use(cors())
        Index.app.use(bodyParser.json({ limit: '10mb' })); // Pour les données JSON
        Index.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // Pour les données encodées dans l'URL
    }

    static jobsConfig() {
        cron.schedule('0 1 * * *', async () => {
            // Ready to handle jobs :)
        });
    }


    static routeConfig() {
        Index.app.use('/user', userRouter)
        Index.app.use('/auth', authRouter)
        Index.app.use('/car', carRouter)
        Index.app.use('/entry', entryRouter)
    }

    static swaggerConfig() {
        const swaggerUi = require('swagger-ui-express')
        Index.app.use('/docs', basicAuth({
            users: {'CARKIT': 'CARKIT'},
            challenge: true,
        }), swaggerUi.serve, swaggerUi.setup(swaggerJsonFile))
    }

    static statsConfig() {
        Index.app.use(swStats.getMiddleware({
            swaggerSpec:swaggerJsonFile,
            authentication: true,
            sessionMaxAge: 900,
            onAuthenticate: (req,username,password) => {
                // CAN INSERT REAL LOGIC HERE
                return((username==='carkit') && (password==='carkit') );
            }
        }))
    }
    static imageFolder() {
        if (process.env.STORAGE_FOLDER) {
            Index.app.use("/image", express.static(process.env.STORAGE_FOLDER));
        } else {
            console.error("Can't store image, path not set.")
        }
    }

    static redirectConfig() {
        Index.app.use((req, res) => {
            res.redirect('https://remi-weil.fr');
        });
    }

    static socketConfig() {
        initSocket(this.io)
    }

    static async databaseConfig() {
        await AppDataSource.initialize().then(async () => {
            console.log("DB Connecté")
        });
    }

    static startServer() {
        Index.server.listen(process.env.PORT, () => {
            console.log(`API démarrée sur le port ${process.env.PORT}....`);
            Index.app.emit("ready");
        });
    }

    static async main() {
        Index.jobsConfig()
        Index.swaggerConfig()
        Index.statsConfig()
        Index.globalConfig()
        Index.routeConfig()
        Index.socketConfig()
        Index.imageFolder()
        Index.redirectConfig()
        await Index.databaseConfig()
        Index.startServer()
    }

}

Index.main() 