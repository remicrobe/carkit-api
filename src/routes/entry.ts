import express = require("express");
import { apiTokenMiddleware } from "../middlewares/checkApiToken";
import { User } from "../database/entity/user.entity";
import { ErrorHandler } from "../utils/error/error-handler";
import { EntryRepository } from "../database/repository/entry.repository";
import { checkRequiredField } from "../utils/global";
import { Entry } from "../database/entity/entry.entity";
import { CarRepository } from "../database/repository/car.repository";

const entryRouter = express.Router();

entryRouter.get('/:carId', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Entry']
        #swagger.path = '/entry/{carId}'
        #swagger.method = 'get'
        #swagger.description = 'Get all entries of a specific car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.responses[200] = {
            description: 'Entries retrieved successfully.',
            schema: [
                 {
                    $ref: '#/definitions/Entry'
                }
            ]
        }
        #swagger.responses[401] = {
            description: 'Unauthorized. No valid token provided.',
            schema: {
                status: 401,
                msg: 'Unauthorized.'
            }
        }
    */

    try {
        const user: User = res.locals.connectedUser;
        const { carId } = req.params;

        const entries = await EntryRepository.find({
            where: {
                car: {
                    id: Number(carId),
                    user: user
                }
            },
            relations: {
                car: true
            }
        });

        return res.send(entries);
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
});

entryRouter.post('/:carId', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Entry']
        #swagger.path = '/entry/{carId}'
        #swagger.description = 'Create a new entry for a specific car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Entry data',
            required: true,
            schema: {
                $ref: '#/definitions/PostEntry'
            }
        }
        #swagger.responses[200] = {
            description: 'Entry created successfully.',
            schema: {
                $ref: '#/definitions/Entry'
            }
        }
        #swagger.responses[422] = {
            description: 'Unprocessable entity. Required fields missing.',
            schema: {
                status: 422,
                msg: 'Required fields missing.'
            }
        }
    */

    try {
        const user: User = res.locals.connectedUser;
        const { carId } = req.params;
        const {
            type,
            part,
            spendingType,
            price,
            quantity,
            mileage,
            notes
        } = req.body;

        if (!checkRequiredField([
            type
        ])) {
            return res.sendStatus(422);
        }

        const car = await CarRepository.findOneByOrFail({
            id: Number(carId),
            user: user
        });

        const entry = new Entry();
        entry.type = type;
        entry.part = part;
        entry.spendingType = spendingType;
        entry.price = price;
        entry.quantity = quantity;
        entry.mileage = mileage;
        entry.notes = notes;
        entry.car = car;

        await EntryRepository.save(entry);

        return res.send(entry);
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
});

entryRouter.put('/:carId/:entryId', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Entry']
        #swagger.path = '/entry/{carId}/{entryId}'
        #swagger.description = 'Update an entry for a specific car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.parameters['entryId'] = {
            in: 'path',
            description: 'Entry ID',
            required: true,
            type: 'integer'
        }
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Entry update data',
            required: true,
            schema: {
                $ref: '#/definitions/PostEntry'
            }
        }
        #swagger.responses[200] = {
            description: 'Entry updated successfully.',
            schema: {
                $ref: '#/definitions/Entry'
            }
        }
        #swagger.responses[401] = {
            description: 'Unauthorized. No valid token provided.',
            schema: {
                status: 401,
                msg: 'Unauthorized.'
            }
        }
        #swagger.responses[422] = {
            description: 'Unprocessable entity. Required fields missing.',
            schema: {
                status: 422,
                msg: 'Required fields missing.'
            }
        }
    */

    try {
        const user: User = res.locals.connectedUser;
        const { carId, entryId } = req.params;
        const {
            type,
            part,
            spendingType,
            price,
            quantity,
            mileage,
            notes
        } = req.body;

        const entry = await EntryRepository.findOneByOrFail({
            id: Number(entryId),
            car: {
                id: Number(carId),
                user: user
            }
        });

        if (!checkRequiredField([
            type
        ])) {
            return res.sendStatus(422);
        }

        entry.type = type;
        entry.part = part;
        entry.spendingType = spendingType;
        entry.price = price;
        entry.quantity = quantity;
        entry.mileage = mileage;
        entry.notes = notes;

        await EntryRepository.save(entry);

        return res.send(entry);
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
});

entryRouter.delete('/:carId/:entryId', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Entry']
        #swagger.path = '/entry/{carId}/{entryId}'
        #swagger.description = 'Delete an entry for a specific car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.parameters['entryId'] = {
            in: 'path',
            description: 'Entry ID',
            required: true,
            type: 'integer'
        }
        #swagger.responses[200] = {
            description: 'Entry deleted successfully.',
            schema: {
                msg: 'deleted',
                status: 200
            }
        }
        #swagger.responses[401] = {
            description: 'Unauthorized. No valid token provided.',
            schema: {
                status: 401,
                msg: 'Unauthorized.'
            }
        }
    */

    try {
        const user: User = res.locals.connectedUser;
        const { carId, entryId } = req.params;

        const entry = await EntryRepository.findOneByOrFail({
            id: Number(entryId),
            car: {
                id: Number(carId),
                user: user
            }
        });

        await EntryRepository.delete(entry);

        return res.send({ msg: 'deleted' });
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
});

export { entryRouter };
