const swaggerAutogen = require('swagger-autogen')()

const outputFile = './src/docs/swagger_output.json'
const endpointsFiles = [
    './src/routes/auth.ts',
    './src/routes/car.ts',
    './src/routes/user.ts',
    './src/routes/entry.ts',
]

const doc = {
    info: {
        title: 'carkit API',
        description: 'API for carkit',
    },
    host: [
        'theodev.myftp.org:86',
    ],
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Enter your Bearer token in the format **Bearer &lt;token&gt;**'
        }
    },
    security: [
        {
            Bearer: []
        }
    ],
    definitions: {
        User: {
            id: 1,
            email: 'john.doe@gmail.com',
            imageLink: 'https://example.com/image.jpg',
            isGuest: false
        },
        PutCar: {
            name: 'string',
            fabricant: 'string',
            vin: 'string',
            licencePlate: 'string',
            type: 'number',
            color: 'string',
            model: 'string',
            mileage: 'number',
            year: 'number',
            fuel: 'number',
            unit: 'number',
            purchasePrice: 'number',
            purchaseDate: 'Date',
            mileageAtPurchase: 'number',
            archivedAt: 'Date',
            note: 'string',
            typeOfUse: 'CarTypeOfUse'
        },
        PostCar: {
            name: 'string',
            fabricant: 'string',
            vin: 'string',
            licencePlate: 'string',
            type: 'number',
            color: 'string',
            model: 'string',
            mileage: 'number',
            year: 'number',
            fuel: 'number',
            unit: 'number',
            purchasePrice: 'number',
            purchaseDate: 'Date',
            mileageAtPurchase: 'number',
            archivedAt: 'Date',
            note: 'string',
            typeOfUse: 'CarTypeOfUse',
            image: [{
                id: 'number',
                link: 'string'
            }]
        },
        Car: {
            id: 'number',
            name: 'string',
            fabricant: 'string',
            licencePlate: 'string',
            vin: 'string',
            type: 'number',
            color: 'string',
            model: 'string',
            mileage: 'number',
            year: 'number',
            fuel: 'number',
            unit: 'number',
            purchasePrice: 'number',
            purchaseDate: 'Date',
            mileageAtPurchase: 'number',
            archivedAt: 'Date',
            note: 'string',
            typeOfUse: 'CarTypeOfUse',
            image: [{
                id: 'number',
                link: 'string'
            }]
        },
        entry: {
            id: 'number',
            type: 'EntryType',
            part: 'CarPart?',
            spendingType: 'SpendingType?',
            price: 'number?',
            quantity: 'number?',
            date: 'Date',
            mileage: 'number?',
            notes: 'string?',
        },
        PostEntry: {
            type: 'EntryType',
            part: 'CarPart?',
            spendingType: 'SpendingType?',
            price: 'number?',
            quantity: 'number?',
            date: 'Date',
            mileage: 'number?',
            notes: 'string?',
        },
        Image: {
            id: 'number',
            link: 'string'
        }
    }
};

swaggerAutogen(outputFile, endpointsFiles, doc)
