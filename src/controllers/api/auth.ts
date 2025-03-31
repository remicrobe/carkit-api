import { Controller, Post, Error, AutoDoc } from "../../decorators";
import { Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { getAppleSignInKey } from "../../utils/auth/apple/apple";
import { User } from "../../database/entity/user.entity";
import { JwtPayload } from "jsonwebtoken";
import { UserRepository } from "../../database/repository/user.repository";
import * as googleAuth from 'google-auth-library';
import { generateJwt } from "../../utils/jwt/generate";
import { Equal } from "typeorm";

@Controller('auth')
export default class AuthController {

    @Post('/apple/')
    @Error()
    @AutoDoc({
        tags: ['Auth'],
        httpMethod: 'POST',
        description: `Authentification avec Apple. Si "needStepTwo" est true, il faut afficher une page pour demander username, firstname et lastname et faire l'authentification sur une autre route avec le token renvoyé.`,
        fullPath: '/auth/apple/',
        parameters: [
            {
                body: {
                    required: true,
                    description: 'Informations pour identifier l\'utilisateur (ex: identityToken)',
                    exemple: { identityToken: 'identityToken' }
                }
            }
        ],
        responses: [
            { code: 200, exemple: { /* Référence vers la définition User */ } }
        ]
    })
    public async appleAuth(req: Request, res: Response) {
        const { identityToken } = req.body;
        const decoded = jwt.decode(identityToken, { complete: true });
        const kid = decoded?.header?.kid;
        const appleKey = await getAppleSignInKey(kid);
        const check = jwt.verify(identityToken, appleKey);

        if (!check) {
            return res.sendStatus(401);
        }

        let appleUser = await UserRepository.findOneBy({
            email: (decoded?.payload as JwtPayload).email,
            isDeleted: Equal(false)
        });

        if (!appleUser) {
            appleUser = UserRepository.createUser(
                (decoded?.payload as JwtPayload).email,
                "apple_account",
                "apple_account",
                false,
            );
        }

        appleUser = await UserRepository.save(appleUser);

        res.send({
            ...appleUser,
            token: generateJwt("token", appleUser.id),
            refreshToken: generateJwt("refreshToken", appleUser.id)
        });
    }

    @Post('/google/')
    @Error()
    @AutoDoc({
        tags: ['Auth'],
        httpMethod: 'POST',
        description: `Authentification avec Google. Si "needStepTwo" est true, il faut afficher une page pour demander username, firstname et lastname et faire l'authentification sur une autre route avec le token renvoyé.`,
        fullPath: '/auth/google/',
        parameters: [
            {
                body: {
                    required: true,
                    description: 'Informations pour identifier l\'utilisateur (ex: identityToken)',
                    exemple: { identityToken: 'identityToken' }
                }
            }
        ],
        responses: [
            { code: 200, exemple: { /* Référence vers la définition User */ } }
        ]
    })
    public async googleAuth(req: Request, res: Response) {
        const { identityToken } = req.body;
        const client = new googleAuth.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: identityToken,
            audience: ['751070485057-jmt56tmfmojpr690kl0nt2n5tg2v3390.apps.googleusercontent.com']
        });
        const payload = ticket.getPayload();

        let googleUser = await UserRepository.findOneBy({
            email: payload['email'],
            isDeleted: Equal(false)
        });

        if (!googleUser) {
            googleUser = UserRepository.createUser(
                payload['email'],
                'google_account',
                "google_account",
                false,
            );
        }

        googleUser = await UserRepository.save(googleUser);

        res.send({
            ...googleUser,
            token: generateJwt("token", googleUser.id),
            refreshToken: generateJwt("refreshToken", googleUser.id)
        });
    }
}
