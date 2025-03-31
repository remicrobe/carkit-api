// src/decorators/auto-doc-entity.decorator.ts
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import 'reflect-metadata';

const docsDir = join(__dirname, '../docs');
const outputFile = join(docsDir, 'swagger_output.json');

interface SwaggerPropertyOptions {
    type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
    format?: string;
    example?: any;
    description?: string;
    nullable?: boolean;
    items?: SwaggerPropertyOptions;
    $ref?: string;
}

// Fonction pour charger la spécification Swagger existante ou créer une nouvelle
function loadOrCreateSwaggerSpec() {
    if (existsSync(outputFile)) {
        try {
            const content = readFileSync(outputFile, 'utf8');
            return JSON.parse(content);
        } catch (e) {
            console.error('Error reading existing swagger file, creating new one', e);
        }
    }

    return {
        swagger: "2.0",
        info: {
            title: "CarKit API Documentation",
            version: "0.0.1"
        },
        host: process.env.API_PATH,
        schemes: ["http", "https"],
        paths: {},
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Enter your Bearer token in the format **Bearer <token>**"
            }
        },
        "consumes": [
            "application/json"
        ],
        "produces": [
            "application/json"
        ],
    };
}

export function ApiProperty(options?: SwaggerPropertyOptions): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const properties = Reflect.getMetadata('swagger:properties', target.constructor) || {};
        properties[propertyKey] = options || {};
        Reflect.defineMetadata('swagger:properties', properties, target.constructor);
    };
}

export function AutoDocEntity(): ClassDecorator {
    return (target: any) => {
        if (process.env.NODE_ENV === 'production') return;

        // Charger la spécification existante
        const swaggerSpec = loadOrCreateSwaggerSpec();

        if (!swaggerSpec.definitions) {
            swaggerSpec.definitions = {};
        } else if (!swaggerSpec.definitions) {
            swaggerSpec.definitions = {};
        }

        const properties: Record<string, SwaggerPropertyOptions> =
            Reflect.getMetadata('swagger:properties', target) || {};

        const schema = {
            type: 'object',
            properties: {},
            required: [] as string[]
        };

        // Get all class properties
        const instance = new target();
        for (const propertyName in instance) {
            if (instance.hasOwnProperty(propertyName)) {
                // If property has ApiProperty decorator, use its options
                if (properties[propertyName]) {
                    schema.properties[propertyName] = properties[propertyName];
                    if (!properties[propertyName].nullable) {
                        schema.required.push(propertyName);
                    }
                } else {
                    // Infer type from the property value
                    const type = typeof instance[propertyName];
                    let swaggerType: SwaggerPropertyOptions['type'];

                    switch (type) {
                        case 'string':
                            swaggerType = 'string';
                            break;
                        case 'number':
                            swaggerType = 'number';
                            break;
                        case 'boolean':
                            swaggerType = 'boolean';
                            break;
                        case 'object':
                            if (instance[propertyName] instanceof Date) {
                                swaggerType = 'string';
                                schema.properties[propertyName] = {
                                    type: 'string',
                                    format: 'date-time'
                                };
                            } else if (Array.isArray(instance[propertyName])) {
                                swaggerType = 'array';
                                schema.properties[propertyName] = {
                                    type: 'array',
                                    items: { type: 'object' }
                                };
                            } else {
                                swaggerType = 'object';
                                schema.properties[propertyName] = { type: 'object' };
                            }
                            break;
                        default:
                            swaggerType = 'string';
                    }

                    if (!schema.properties[propertyName]) {
                        schema.properties[propertyName] = { type: swaggerType };
                    }

                    // Assume all properties are required by default
                    schema.required.push(propertyName);
                }
            }
        }

        swaggerSpec.definitions[target.name] = schema;

        // Création du dossier si nécessaire
        if (!existsSync(docsDir)) {
            mkdirSync(docsDir, { recursive: true });
        }

        writeFileSync(outputFile, JSON.stringify(swaggerSpec, null, 2), 'utf8');
    };
}