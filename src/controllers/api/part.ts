import { Controller, Get, Post, Put, Delete, Error, AutoDoc, CheckJwt } from "../../decorators";
import { Request, Response } from "express";
import { Part } from "../../database/entity/part.entity";
import { PartRepository } from "../../database/repository/part.repository";
import { CarRepository } from "../../database/repository/car.repository";
import { statusMsg } from "../../utils/global";
import { ErrorHandler } from "../../utils/error/error-handler";

@Controller('part')
export default class PartController {

    @Post('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Part'],
        httpMethod: 'POST',
        description: 'Create a new custom part for a car.',
        fullPath: '/part/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Part creation data',
                exemple: {
                    name: 'Brakes',
                    status: 'enable',
                    advicedRevision: 'Check every 20,000 km',
                    isCustom: true
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', name: 'Brakes', status: 'enable', advicedRevision: 'Check every 20,000 km', isCustom: true } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async createPart(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const { name, status, advicedRevision, isCustom } = req.body;

            const car = await CarRepository.findOneOrFail({ where: { id: Number(carId) } });

            const part = new Part();
            part.name = name;
            part.status = status;
            part.advicedRevision = advicedRevision || null;
            part.car = car;

            const savedPart = await PartRepository.save(part);

            return res.send(savedPart);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Get('/:carId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Part'],
        httpMethod: 'GET',
        description: 'Get all parts for a car.',
        fullPath: '/part/{carId}',
        parameters: [{
            path: [
                { name: 'carId', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: [{ id: 'uuid', name: 'Brakes', status: 'enable', advicedRevision: 'Check every 20,000 km', isCustom: true }] },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async getParts(req: Request, res: Response) {
        try {
            const { carId } = req.params;
            const parts = await PartRepository.find({
                where: { car: { id: Number(carId) } },
                order: { createdAt: 'DESC' }
            });
            return res.send(parts);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Put('/:id')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Part'],
        httpMethod: 'PUT',
        description: 'Update a custom part.',
        fullPath: '/part/{id}',
        parameters: [{
            path: [
                { name: 'id', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Part update data',
                exemple: {
                    name: 'Updated Brakes',
                    status: 'disabled',
                    advicedRevision: 'Check every 15,000 km'
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', name: 'Updated Brakes', status: 'disabled', advicedRevision: 'Check every 15,000 km', isCustom: true } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Part not found.' } }
        ]
    })
    public async updatePart(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, status, advicedRevision } = req.body;

            const part = await PartRepository.findOneOrFail({ where: { id: Number(id) } });

            if (name) part.name = name;
            if (status) part.status = status;
            if (advicedRevision) part.advicedRevision = advicedRevision;

            const updatedPart = await PartRepository.save(part);

            return res.send(updatedPart);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Delete('/:id')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Part'],
        httpMethod: 'DELETE',
        description: 'Delete a custom part.',
        fullPath: '/part/{id}',
        parameters: [{
            path: [
                { name: 'id', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: { status: 200, msg: 'Part deleted successfully.' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Part not found.' } }
        ]
    })
    public async deletePart(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const part = await PartRepository.findOneOrFail({ where: { id: Number(id) } });
            await PartRepository.remove(part);
            return res.send(statusMsg(200, 'Part deleted successfully.'));
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }
}