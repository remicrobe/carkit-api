import { Request, Response, NextFunction } from "express";
import { Equal } from "typeorm";
import HttpCode from "../config/http-code";
import { UserRepository } from "../database/repository/user.repository";
import {verifyJwt} from "../utils/jwt/verify";

/*
    Vérifie le token JWT et s'assure que l'utilisateur est connecté.
*/
export function CheckJwt() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const req = args[0] as Request;
            const res = args[1] as Response;
            const next = args[2] as NextFunction;

            // Récupérer et vérifier le token
            const authHeader = req.headers['authorization'];

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(HttpCode.FORBIDDEN).json({ message: "Token manquant ou mal formé." });
            }

            const token = authHeader.split(' ')[1];
            try {
                let userId = verifyJwt("token", token)
                if (!userId) {
                    return res.status(HttpCode.FORBIDDEN).json({ message: "Token manquant ou mal formé." });
                }


                let collab = await UserRepository.findOneBy({
                    id: Equal(userId),
                    isDeleted: Equal(false)
                })


                if (!collab) {
                    return res.status(HttpCode.FORBIDDEN).json({ message: "Utilisateur introuvable ou supprimé." });
                }

                res.locals.user = collab;
                originalMethod.apply(this, args);
            } catch (error) {
                return res.status(HttpCode.FORBIDDEN).json({ message: "Token invalide ou expiré." });
            }
        };
    };
}
