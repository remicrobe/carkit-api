import { AutoDoc, CheckJwt, Controller, Delete, Error, Get, Post } from "../../decorators";
import { Request, Response } from "express";
import { SpendingEntry } from "../../database/entity/spending-entry.entity";
import { SpendingEntryRepository } from "../../database/repository/spending-entry.repository";
import { CarRepository } from "../../database/repository/car.repository";
import { PartRepository } from "../../database/repository/part.repository";
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
                    amount: 150.75,
                    date: '2023-01-01',
                    type: 'insurance',
                    name: 'Annual insurance',
                    recurrence: 'yearly',
                    quantity: 1,
                    unit: 'item',
                    partId: 1
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', amount: 150.75, date: '2023-01-01', type: 'insurance', name: 'Annual insurance' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async addSpending(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const { amount, date, type, name, recurrence, quantity, unit, partId } = req.body;

            const car = await CarRepository.findOneOrFail({ where: { id: Number(carId) } });

            const entry = new SpendingEntry();
            entry.amount = amount;
            entry.date = date;
            entry.type = type;
            entry.name = name || null;
            entry.recurrence = recurrence || null;
            entry.quantity = quantity || null;
            entry.unit = unit || null;
            entry.car = car;

            if (partId) {
                entry.vehiclePart = await PartRepository.findOneOrFail ({ where: { id: partId } });
            }

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
            { code: 200, exemple: [{ id: 'uuid', amount: 150.75, date: '2023-01-01', type: 'insurance', name: 'Annual insurance' }] },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async getSpendings(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const entries = await SpendingEntryRepository.find({
                where: { car: { id: Number(carId) } },
                relations: ['vehiclePart'],
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