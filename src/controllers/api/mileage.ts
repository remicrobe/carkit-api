import { Controller, Get, Post, Delete, Error, AutoDoc, CheckJwt } from "../../decorators";
import { Request, Response } from "express";
import { MileageEntry } from "../../database/entity/mileage-entry.entity";
import { MileageEntryRepository } from "../../database/repository/mileage-entry.repository";
import { CarRepository } from "../../database/repository/car.repository";
import { statusMsg } from "../../utils/global";
import { ErrorHandler } from "../../utils/error/error-handler";

@Controller('mileage')
export default class MileageEntryController {

    @Post('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Mileage'],
        httpMethod: 'POST',
        description: 'Add a new mileage entry for a car.',
        fullPath: '/mileage/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Mileage entry data',
                exemple: {
                    mileage: 15000,
                    date: '2023-01-01'
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', mileage: 15000, date: '2023-01-01' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async addMileage(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const { mileage, date } = req.body;

            const car = await CarRepository.findOneOrFail({ where: { id: Number(carId) } });

            const entry = new MileageEntry();
            entry.mileage = mileage;
            entry.date = date;
            entry.car = car;

            const savedEntry = await MileageEntryRepository.save(entry);

            return res.send(savedEntry);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Get('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Mileage'],
        httpMethod: 'GET',
        description: 'Get all mileage entries for a car.',
        fullPath: '/mileage/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: [{ id: 'uuid', mileage: 15000, date: '2023-01-01' }] },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async getMileages(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const entries = await MileageEntryRepository.find({
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
        tags: ['Mileage'],
        httpMethod: 'DELETE',
        description: 'Delete a mileage entry.',
        fullPath: '/mileage/{id}',
        parameters: [{
            path: [
                { name: 'id', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: { status: 200, msg: 'Mileage entry deleted successfully.' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Mileage entry not found.' } }
        ]
    })
    public async deleteMileage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const entry = await MileageEntryRepository.findOneOrFail({ where: { id: Number(id) } });
            await MileageEntryRepository.remove(entry);
            return res.send(statusMsg(200, 'Mileage entry deleted successfully.'));
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }
}