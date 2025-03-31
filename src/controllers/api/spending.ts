import { Controller, Get, Post, Delete, Error, AutoDoc, CheckJwt } from "../../decorators";
import { Request, Response } from "express";
import { SpendingEntry } from "../../database/entity/spending-entry.entity";
import { SpendingEntryRepository } from "../../database/repository/spending-entry.repository";
import { CarRepository } from "../../database/repository/car.repository";
import { statusMsg } from "../../utils/global";
import { ErrorHandler } from "../../utils/error/error-handler";

@Controller('spending')
export default class SpendingEntryController {

    @Post('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Spending'],
        httpMethod: 'POST',
        description: 'Add a new spending entry for a car.',
        fullPath: '/spending/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Spending entry data',
                exemple: {
                    cost: 150.75,
                    date: '2023-01-01',
                    type: 'insurance',
                    name: 'Annual insurance'
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', cost: 150.75, date: '2023-01-01', type: 'insurance', name: 'Annual insurance' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async addSpending(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const { cost, date, type, name } = req.body;

            const car = await CarRepository.findOneOrFail({ where: { id: Number(carId) } });

            const entry = new SpendingEntry();
            entry.cost = cost;
            entry.date = date;
            entry.type = type;
            entry.name = name || null;
            entry.car = car;

            const savedEntry = await SpendingEntryRepository.save(entry);

            return res.send(savedEntry);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Get('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Spending'],
        httpMethod: 'GET',
        description: 'Get all spending entries for a car.',
        fullPath: '/spending/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: [{ id: 'uuid', cost: 150.75, date: '2023-01-01', type: 'insurance', name: 'Annual insurance' }] },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async getSpendings(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const entries = await SpendingEntryRepository.find({
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
        tags: ['Spending'],
        httpMethod: 'DELETE',
        description: 'Delete a spending entry.',
        fullPath: '/spending/{id}',
        parameters: [{
            path: [
                { name: 'id', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: { status: 200, msg: 'Spending entry deleted successfully.' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Spending entry not found.' } }
        ]
    })
    public async deleteSpending(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const entry = await SpendingEntryRepository.findOneOrFail({ where: { id: Number(id) } });
            await SpendingEntryRepository.remove(entry);
            return res.send(statusMsg(200, 'Spending entry deleted successfully.'));
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }
}