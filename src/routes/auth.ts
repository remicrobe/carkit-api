import express = require("express");
import * as jwt from 'jsonwebtoken'
import {ErrorHandler} from "../utils/error/error-handler";
import {getAppleSignInKey} from "../utils/auth/apple/apple";
import {User} from "../database/entity/user.entity";
import {JwtPayload} from "jsonwebtoken";
import {UserRepository} from "../database/repository/user.repository";
import {checkRequiredField} from "../utils/global";
import * as googleAuth from 'google-auth-library';
import {generateJwt} from "../utils/jwt/generate";
import {Equal} from "typeorm";
import {apiTokenMiddleware} from "../middlewares/checkApiToken";

const authRouter = express.Router();

authRouter.post('/apple/', async (req, res) => {
    /*  #swagger.tags = ['Auth']
        #swagger.path = '/auth/apple/'
        #swagger.description = 'Authentification avec apple voir la réponse, si needStepTwo = true dans ce cas tu affiches une page pour demander username firstname et lastname et tu fais apple a l'autre routes avec le token que je te renvoi dans cette même routes.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations pour identifier l'utilisateur',
            required: true,
            schema: {
                identityToken: 'identityToken',
            }
        }
        #swagger.responses[200] = {
            description: 'Successful authentication',
            schema: {
                $ref: '#/definitions/User'
            }
        }
 */
    try {
        const {identityToken} = req.body;

        const json = jwt.decode(identityToken, {complete: true})
        const kid = json?.header?.kid
        const appleKey = await getAppleSignInKey(kid)
        const check = jwt.verify(identityToken, appleKey)

        if (!check) {
            return res.sendStatus(401)
        }

        let appleUser = await UserRepository.findOneBy({email: (json?.payload as JwtPayload).email, isDeleted: Equal(false)})
        if (!appleUser) {
            appleUser = UserRepository.createUser(
                (json?.payload as JwtPayload).email,
                "apple_account",
                "apple_account",
                false,
            )
        }

        appleUser = await UserRepository.save(appleUser)

        res.send({
            ...appleUser,
            token: generateJwt("token", appleUser.id),
            refreshToken: generateJwt("refreshToken", appleUser.id)
        })
    } catch (e) {
        ErrorHandler(e, req, res);
    }
})

authRouter.post('/google/', async (req, res) => {
    /*  #swagger.tags = ['Auth']
        #swagger.path = '/auth/google/'
        #swagger.description = 'Authentification avec google voir la réponse, si needStepTwo = true dans ce cas tu affiches une page pour demander username firstname et lastname et tu fais apple a l'autre routes avec le token que je te renvoi dans cette même routes.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Informations pour identifier l'utilisateur',
            required: true,
            schema: {
                identityToken: 'identityToken',
            }
        }
        #swagger.responses[200] = {
            description: 'Successful authentication',
            schema: {
                $ref: '#/definitions/User'
            }
        }
 */
    try {
        const {identityToken} = req.body;

        const client = new googleAuth.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: identityToken,
            audience: ['youre-audience-id-here'],
        });
        const payload = ticket.getPayload();

        let googleUser = await UserRepository.findOneBy({email: payload['email'], isDeleted: Equal(false)})
        if (!googleUser) {
            googleUser = UserRepository.createUser(
                payload['email'],
                'google_account',
                "google_account",
                false,
            )
        }

        googleUser = await UserRepository.save(googleUser)

        res.send({
            ...googleUser,
            token: generateJwt("token", googleUser.id),
            refreshToken: generateJwt("refreshToken", googleUser.id)
        })
    } catch (e) {
        ErrorHandler(e, req, res);
    }
})


export {authRouter}
