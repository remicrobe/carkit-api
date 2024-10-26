import express = require("express");
import { apiTokenMiddleware } from "../middlewares/checkApiToken";
import { User } from "../database/entity/user.entity";
import { ErrorHandler } from "../utils/error/error-handler";
import { CarRepository } from "../database/repository/car.repository";
import { checkRequiredField } from "../utils/global";
import { Car } from "../database/entity/car.entity";
import { base64tojpeg } from "../utils/image/base64tojpeg";
import { Image } from "../database/entity/image.entity";
import { ImageRepository } from "../database/repository/image.repository";

const carRouter = express.Router();

carRouter.get('/', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Car']
        #swagger.path = '/car/'
        #swagger.method = 'get'
        #swagger.description = 'Get all cars of the connected user.'
        #swagger.responses[200] = {
            description: 'Cars retrieved successfully.',
            schema: [
                 {
                    $ref: '#/definitions/Car'
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

        const myCars = await CarRepository.find({
            where: {
                user: user
            },
            relations: {
                images: true
            }
        })

        return res.send(myCars);
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
})

carRouter.post('/', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Car']
        #swagger.path = '/car/'
        #swagger.description = 'Create a new car.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Car data',
            required: true,
            schema: {
                $ref: '#/definitions/PostCar'
            }
        }
        #swagger.responses[200] = {
            description: 'Car created successfully.',
            schema: {
                $ref: '#/definitions/Car'
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

        const {
            name,
            fabricant,
            licencePlate,
            type,
            color,
            model,
            mileage,
            year,
            fuel,
            unit,
            purchasePrice,
            purchaseDate,
            mileateAtPurchase,
            note,
            images
        } = req.body;

        if (!checkRequiredField([
            name
        ])) {
            return res.sendStatus(422);
        }

        const car = new Car();
        car.name = name;
        car.fabricant = fabricant;
        car.licencePlate = licencePlate;
        car.type = type;
        car.color = color;
        car.model = model;
        car.mileage = mileage;
        car.year = year;
        car.fuel = fuel;
        car.unit = unit;
        car.purchasePrice = purchasePrice;
        car.purchaseDate = purchaseDate;
        car.mileageAtPurchase = mileateAtPurchase;
        car.note = note;
        car.user = user;
        car.images = [];

        if (Array.isArray(images) && images.length > 0) {
            for (let image of images) {
                const img = new Image();
                img.link = await base64tojpeg(image)
                car.images.push(img);
            }
        }

        await CarRepository.save(car)

        return res.send(car);
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
})

carRouter.post('/image/:carId/', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Car']
        #swagger.path = '/car/image/{carId}'
        #swagger.description = 'Add images to a car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Images data',
            required: true,
            schema: ['base64Image']
        }
        #swagger.responses[200] = {
            description: 'Images added successfully.',
            schema: [ {
                    $ref: '#/definitions/Image'
                } ]
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
        const { images } = req.body

        const car = await CarRepository.findOneByOrFail({
            id: Number(carId),
            user: user
        })

        const imagesEnt: Image[] = [];

        if (Array.isArray(images) && images.length > 0) {
            for (let image of images) {
                const img = new Image();
                img.link = await base64tojpeg(image)
                imagesEnt.push(img);
            }
        }

        await ImageRepository.save(imagesEnt);

        return res.send(imagesEnt);
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
})

carRouter.delete('/image/:carId/:imageId', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Car']
        #swagger.path = '/car/image/{carId}/{imageId}'
        #swagger.description = 'Delete an image from a car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.parameters['imageId'] = {
            in: 'path',
            description: 'Image ID',
            required: true,
            type: 'integer'
        }
        #swagger.responses[200] = {
            description: 'Image deleted successfully.',
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

        const { imageId, carId } = req.params;

        const image = await ImageRepository.findOneByOrFail({
            id: Number(imageId),
            car: {
                id: Number(carId),
                user: user
            },
        })

        await ImageRepository.delete(image);

        return res.send({ msg: 'deleted' });
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
})

carRouter.delete('/:carId', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Car']
        #swagger.path = '/car/{carId}'
        #swagger.description = 'Delete a car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.responses[200] = {
            description: 'Car deleted successfully.',
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

        const { carId } = req.params;

        const car = await CarRepository.findOneByOrFail({
            id: Number(carId),
            user: user
        });

        await CarRepository.delete(car);

        return res.send({ msg: 'deleted' });
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
})

carRouter.put('/:carId', apiTokenMiddleware, async (req, res) => {
    /*  #swagger.tags = ['Car']
        #swagger.path = '/car/{carId}'
        #swagger.description = 'Update a car.'
        #swagger.parameters['carId'] = {
            in: 'path',
            description: 'Car ID',
            required: true,
            type: 'integer'
        }
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Car update data',
            required: true,
            schema: {
                $ref: '#/definitions/PutCar'
            }
        }
        #swagger.responses[200] = {
            description: 'Car updated successfully.',
            schema: {
                $ref: '#/definitions/Car'
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

        const { carId } = req.params;
        const {
            name,
            fabricant,
            licencePlate,
            type,
            color,
            model,
            mileage,
            year,
            fuel,
            unit,
            purchasePrice,
            purchaseDate,
            mileateAtPurchase,
            note,
        } = req.body;

        const car = await CarRepository.findOneByOrFail({
            id: Number(carId),
            user: user
        });

        if (!checkRequiredField([
            name
        ])) {
            return res.sendStatus(422);
        }

        car.name = name;
        car.fabricant = fabricant;
        car.licencePlate = licencePlate;
        car.type = type;
        car.color = color;
        car.model = model;
        car.mileage = mileage;
        car.year = year;
        car.fuel = fuel;
        car.unit = unit;
        car.purchasePrice = purchasePrice;
        car.purchaseDate = purchaseDate;
        car.mileageAtPurchase = mileateAtPurchase;
        car.note = note;

        await CarRepository.save(car);

        return res.send(car);
    } catch (e) {
        return ErrorHandler(e, req, res);
    }
})

export { carRouter }
