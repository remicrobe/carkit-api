import { Controller, Get, Post, Put, Delete, Error, AutoDoc, CheckJwt } from "../../decorators";
import { Request, Response } from "express";
import { Car } from "../../database/entity/car.entity";
import { CarRepository } from "../../database/repository/car.repository";
import { statusMsg } from "../../utils/global";
import { ErrorHandler } from "../../utils/error/error-handler";
import { ColumnImageTransformer } from "../../database/transformer/ColumnImageTransformer";
import { base64tojpeg } from "../../utils/image/base64tojpeg";
import { deleteImage } from "../../storage/deleteImage";

@Controller ('car')
export default class CarController {

    @Post ('/')
    @CheckJwt ()
    @Error ()
    @AutoDoc ({
        tags: [ 'Car' ],
        httpMethod: 'POST',
        description: 'Create a new car.',
        fullPath: '/car',
        parameters: [ {
            body: {
                required: true,
                description: 'Car creation data',
                exemple: {
                    type: 'ice',
                    model: 'Model S',
                    brand: 'Tesla',
                    name: 'My Tesla',
                    mileageAtStart: 10000,
                    year: 2020,
                    imageData: 'base64ImageString'
                }
            }
        } ],
        responses: [
            { code: 200, exemple: { id: 'uuid', name: 'My Tesla', brand: 'Tesla', model: 'Model S', type: 'ice' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 422, exemple: { status: 422, msg: 'Required fields missing.' } }
        ]
    })
    public async createCar (req: Request, res: Response) {
        try {
            const { type, model, brand, name, mileageAtStart, year, imageData } = req.body;
            const user = res.locals.connectedUser;

            const car = new Car ();
            car.type = type;
            car.model = model;
            car.brand = brand;
            car.name = name;
            car.mileageAtStart = mileageAtStart;
            car.year = year;
            car.user = user;

            if (imageData) {
                car.imageUrl = await base64tojpeg (imageData, { height: 800, width: 800 });
            }

            const savedCar = await CarRepository.save (car);

            return res.send (savedCar);
        } catch (e) {
            return ErrorHandler (e, req, res);
        }
    }

    @Get ('/:id')
    @CheckJwt ()
    @Error ()
    @AutoDoc ({
        tags: [ 'Car' ],
        httpMethod: 'GET',
        description: 'Get car details by ID.',
        fullPath: '/car/{id}',
        parameters: [ {
            path: [
                { name: 'id', exemple: 'uuid' }
            ]
        } ],
        responses: [
            { code: 200, exemple: { id: 'uuid', name: 'My Tesla', brand: 'Tesla', model: 'Model S', type: 'ice' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async getCar (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = res.locals.connectedUser;

            const car = await CarRepository.findOneOrFail ({ where: { id: Number (id), user: { id: user.id } } });
            return res.send (car);
        } catch (e) {
            return ErrorHandler (e, req, res);
        }
    }

    @Get ('/')
    @CheckJwt ()
    @Error ()
    @AutoDoc ({
        tags: [ 'Car' ],
        httpMethod: 'GET',
        description: 'Get all cars for the connected user.',
        fullPath: '/car',
        responses: [
            { code: 200, exemple: [ { id: 'uuid', name: 'My Tesla', brand: 'Tesla', model: 'Model S', type: 'ice' } ] },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } }
        ]
    })
    public async getCars (req: Request, res: Response) {
        try {
            const user = res.locals.connectedUser;
            const cars = await CarRepository.find ({ where: { user: { id: user.id } } });
            return res.send (cars);
        } catch (e) {
            return ErrorHandler (e, req, res);
        }
    }

    @Put ('/:id')
    @CheckJwt ()
    @Error ()
    @AutoDoc ({
        tags: [ 'Car' ],
        httpMethod: 'PUT',
        description: 'Update car details.',
        fullPath: '/car/{id}',
        parameters: [ {
            path: [
                { name: 'id', exemple: 'uuid' }
            ],
            body: {
                required: true,
                description: 'Car update data',
                exemple: {
                    brand: 'Tesla',
                    model: 'Model S',
                    name: 'My Tesla',
                    mileageAtStart: 10000,
                    year: 2020,
                    type: 'ice',
                    imageData: 'base64ImageString'
                }
            }
        } ],
        responses: [
            {
                code: 200,
                exemple: { id: 'uuid', name: 'Updated Tesla', brand: 'Tesla', model: 'Model S', type: 'ice' }
            },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async updateCar (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { brand, model, name, mileageAtStart, year, type, imageData } = req.body;
            const user = res.locals.connectedUser;

            const car = await CarRepository.findOneOrFail ({ where: { id: Number (id), user: { id: user.id } } });

            if (brand) car.brand = brand;
            if (model) car.model = model;
            if (name) car.name = name;
            if (mileageAtStart) car.mileageAtStart = mileageAtStart;
            if (year) car.year = year;
            if (type) car.type = type;

            if (imageData) {
                if (car.imageUrl) {
                    await deleteImage (car.imageUrl);
                }
                car.imageUrl = await base64tojpeg (imageData, { height: 800, width: 800 });
            }

            const updatedCar = await CarRepository.save (car);

            return res.send (updatedCar);
        } catch (e) {
            return ErrorHandler (e, req, res);
        }
    }

    @Delete ('/:id')
    @CheckJwt ()
    @Error ()
    @AutoDoc ({
        tags: [ 'Car' ],
        httpMethod: 'DELETE',
        description: 'Delete a car.',
        fullPath: '/car/{id}',
        parameters: [ {
            path: [
                { name: 'id', exemple: 'uuid' }
            ]
        } ],
        responses: [
            { code: 200, exemple: { status: 200, msg: 'Car deleted successfully.' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } },
            { code: 404, exemple: { status: 404, msg: 'Car not found.' } }
        ]
    })
    public async deleteCar (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = res.locals.connectedUser;

            const car = await CarRepository.findOneOrFail ({ where: { id: Number (id), user: { id: user.id } } });

            if (car.imageUrl) {
                await deleteImage (car.imageUrl);
            }

            await CarRepository.remove (car);
            return res.send (statusMsg (200, 'Car deleted successfully.'));
        } catch (e) {
            return ErrorHandler (e, req, res);
        }
    }
}