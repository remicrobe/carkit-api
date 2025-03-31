import { Controller, Get, Post, Put, Delete, Error, AutoDoc, CheckJwt } from "../../decorators";
import { Request, Response } from "express";
import { Service } from "../../database/entity/service.entity";
import { ServiceRepository } from "../../database/repository/service.repository";
import { PartRepository } from "../../database/repository/part.repository";
import { statusMsg } from "../../utils/global";
import { ErrorHandler } from "../../utils/error/error-handler";
import {Equal} from "typeorm";

@Controller('service')
export default class ServiceController {

    @Post('/:partId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Service'],
        httpMethod: 'POST',
        description: 'Create a new service entry for a part.',
        fullPath: '/service/{partId}',
        parameters: [{
            path: [
                { name: 'partId', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Service creation data',
                exemple: {
                    date: '2023-01-01',
                    mileage: 15000
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', date: '2023-01-01', mileage: 15000 } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Part not found.' } }
        ]
    })
    public async createService(req: Request, res: Response) {
        try {
            const { partId } = req.params;
            const { date, mileage } = req.body;

            const part = await PartRepository.findOneOrFail({ where: { id: Number(partId) } });

            const service = new Service();
            service.date = date;
            service.mileage = mileage;
            service.part = part;

            const savedService = await ServiceRepository.save(service);

            return res.send(savedService);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Get('/:partId')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Service'],
        httpMethod: 'GET',
        description: 'Get all service entries for a part.',
        fullPath: '/service/{partId}',
        parameters: [{
            path: [
                { name: 'partId', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: [{ id: 'uuid', date: '2023-01-01', mileage: 15000 }] },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Part not found.' } }
        ]
    })
    public async getServices(req: Request, res: Response) {
        try {
            const { partId } = req.params;
            const services = await ServiceRepository.find({
                where: { part: { id: Number(partId) } },
                order: { date: 'DESC' }
            });
            return res.send(services);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Put('/:id')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Service'],
        httpMethod: 'PUT',
        description: 'Update a service entry.',
        fullPath: '/service/{id}',
        parameters: [{
            path: [
                { name: 'id', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Service update data',
                exemple: {
                    date: '2023-02-01',
                    mileage: 16000
                }
            }
        }],
        responses: [
            { code: 200, exemple: { id: 'uuid', date: '2023-02-01', mileage: 16000 } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Service not found.' } }
        ]
    })
    public async updateService(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { date, mileage } = req.body;

            const service = await ServiceRepository.findOneOrFail({ where: { id: Number(id) } });

            if (date) service.date = date;
            if (mileage) service.mileage = mileage;

            const updatedService = await ServiceRepository.save(service);

            return res.send(updatedService);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Delete('/:id')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['Service'],
        httpMethod: 'DELETE',
        description: 'Delete a service entry.',
        fullPath: '/service/{id}',
        parameters: [{
            path: [
                { name: 'id', exemple: 'uuid' }
            ]
        }],
        responses: [
            { code: 200, exemple: { status: 200, msg: 'Service deleted successfully.' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Service not found.' } }
        ]
    })
    public async deleteService(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const service = await ServiceRepository.findOneOrFail({ where: {
                id: Equal(Number(id))
                } });
            await ServiceRepository.remove(service);
            return res.send(statusMsg(200, 'Service deleted successfully.'));
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }
}