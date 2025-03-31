import { Request, Response } from "express";
import HttpCode from "../config/http-code";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

export function Error() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (request: Request, response: Response) {
            try {
                await originalMethod.apply(this, [request, response]);
            } catch (error) {
                console.log(error);

                switch (true) {
                    case typeof error === 'number':
                        if (error === 100) {
                            response
                                .status(HttpCode.MULTIPLE_CHOICE)
                                .send({ message: 'Need reset password.' })
                        }

                        break;
                    case typeof error === 'string':
                        response
                            .status(HttpCode.UNPROCESSABLE_ENTITY)
                            .send({ message: error });
                        break;
                    case error instanceof EntityNotFoundError:
                        response
                            .status(HttpCode.NOT_FOUND)
                            .send({ message: `The entity hasn't been found.` });
                        break;
                    case error instanceof QueryFailedError:
                        response
                            .status(HttpCode.UNPROCESSABLE_ENTITY)
                            .send({ message: 'Sql request not OK' });
                        break;
                    default:
                        console.log(error);

                        response
                            .status(HttpCode.INTERNAL_ERROR)
                            .send({ message: 'Something wrong happened.'});
                }
            }
        }

        return descriptor;
    }
}