import { Controller, Get, Post, Delete, Error, AutoDoc, CheckJwt } from "../../decorators";
import { Request, Response } from "express";
import { FullTankEntry } from "../../database/entity/full-tank-entry.entity";
import { FullTankEntryRepository } from "../../database/repository/full-tank-entry.repository";
import { CarRepository } from "../../database/repository/car.repository";
import { statusMsg } from "../../utils/global";
import { ErrorHandler } from "../../utils/error/error-handler";

@Controller('full-tank')
export default class FullTankEntryController {

    @Post('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['FullTank'],
        httpMethod: 'POST',
        description: 'Add a new full tank entry for a car.',
        fullPath: '/full-tank/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Full tank entry data',
                exemple: {
                    quantity: 50,
                    unit: 'liter',
                    cost: 80.50,
                    mileage: 15000,
                    date: '2023-01-01'
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', quantity: 50, unit: 'liter', cost: 80.50, mileage: 15000, date: '2023-01-01' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async addFullTank(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const { quantity, unit, cost, mileage, date } = req.body;

            const car = await CarRepository.findOneOrFail({ where: { id: Number(carId) } });

            const entry = new FullTankEntry();
            entry.quantity = quantity;
            entry.unit = unit;
            entry.cost = cost;
            entry.mileage = mileage;
            entry.date = date;
            entry.car = car;

            const savedEntry = await FullTankEntryRepository.save(entry);

            return res.send(savedEntry);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Get('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['FullTank'],
        httpMethod: 'GET',
        description: 'Get all full tank entries for a car.',
        fullPath: '/full-tank/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: [{ id: 'uuid', quantity: 50, unit: 'liter', cost: 80.50, mileage: 15000, date: '2023-01-01' }] },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async getFullTanks(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const entries = await FullTankEntryRepository.find({
                where: { car: { id: Number(carId) } },
                order: { date: 'DESC' }
            });
            return res.send(entries);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Delete('/:id')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['FullTank'],
        httpMethod: 'DELETE',
        description: 'Delete a full tank entry.',
        fullPath: '/full-tank/{id}',
        parameters: [{
            path: [
                { name: 'id', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: { status: 200, msg: 'Full tank entry deleted successfully.' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Full tank entry not found.' } }
        ]
    })
    public async deleteFullTank(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const entry = await FullTankEntryRepository.findOneOrFail({ where: { id: Number(id) } });
            await FullTankEntryRepository.remove(entry);
            return res.send(statusMsg(200, 'Full tank entry deleted successfully.'));
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }
}