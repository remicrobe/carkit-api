// src/decorators/AutoDoc.ts
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Interfaces pour typer les paramètres et les réponses
export interface AutoDocParameterBody {
    required: boolean;
    description: string;
    exemple: object;
}

export interface AutoDocParameterPathItem {
    name: string;
    exemple: string;
}

export interface AutoDocParameterQueryItem {
    name: string;
    exemple?: string;
    description?: string;
    required?: boolean;
}

export interface AutoDocParameterGroup {
    body?: AutoDocParameterBody;
    path?: AutoDocParameterPathItem[];
    query?: AutoDocParameterQueryItem[];
}

export interface AutoDocResponse {
    code: number;
    exemple: object;
}

export interface AutoDocOptions {
    tags: string[];
    description: string;
    fullPath: string;
    httpMethod?: 'POST' | 'PUT' | 'GET' | 'DELETE';
    parameters?: AutoDocParameterGroup[];
    responses?: AutoDocResponse[];
}

// Chemin du dossier et fichier de sortie Swagger
const docsDir = join(__dirname, '../docs');
const outputFile = join(docsDir, 'swagger_output.json');

// Fonction pour charger ou initialiser la documentation Swagger
function loadOrInitializeSwaggerDoc() {
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

// Création du dossier s'il n'existe pas
if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
}

/**
 * Fonction utilitaire pour transformer les paramètres AutoDoc en format Swagger.
 */
function transformParameters(groups: AutoDocParameterGroup[]): any[] {
    const parameters: any[] = [];

    groups.forEach(group => {
        if (group.body) {
            parameters.push({
                in: "body",
                name: "body",
                required: group.body.required,
                description: group.body.description,
                schema: {
                    type: "object",
                    properties: Object.fromEntries(
                        Object.entries(group.body.exemple).map(([key, value]) => [key, { example: value }])
                    )
                }
            });
        }
        if (group.path) {
            group.path.forEach(item => {
                parameters.push({
                    in: "path",
                    name: item.name,
                    required: true,
                    description: `Path parameter ${item.name}`,
                    schema: {
                        type: "string",
                        example: item.exemple
                    }
                });
            });
        }
        if (group.query) {
            group.query.forEach(item => {
                parameters.push({
                    in: "query",
                    name: item.name,
                    required: item.required ?? false,
                    description: item.description ?? `Query parameter ${item.name}`,
                    schema: {
                        type: "string",
                        example: item.exemple ?? '0'
                    }
                });
            });
        }
    });

    return parameters;
}

/**
 * Fonction utilitaire pour transformer le tableau de réponses AutoDoc en format Swagger.
 */
function transformResponses(responses: AutoDocResponse[]): any {
    const resObj: any = {};
    responses.forEach(resp => {
        resObj[resp.code] = {
            description: "Response",
            examples: resp.exemple
        };
    });
    return resObj;
}

/**
 * Décorateur pour l'auto-documentation.
 */
export function AutoDoc(doc: AutoDocOptions): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const isProduction = process.env.ENVIRONMENT === 'BUILD';
        if (isProduction) {
            return;
        }

        // Charger la documentation existante
        const swaggerDoc = loadOrInitializeSwaggerDoc();

        // Détermine la méthode HTTP
        const httpMethod = (doc.httpMethod || "GET").toLowerCase();

        // Concatène le préfixe API et le fullPath
        const fullPath = `${process.env.API_PATH || ''}${doc.fullPath}`;

        if (!swaggerDoc.paths) {
            swaggerDoc.paths = {};
        }

        // Initialiser le chemin s'il n'existe pas
        if (!swaggerDoc.paths[doc.fullPath]) {
            swaggerDoc.paths[doc.fullPath] = {};
        }

        // Transformation des paramètres et réponses
        const parameters = doc.parameters ? transformParameters(doc.parameters) : [];
        const responses = doc.responses ? transformResponses(doc.responses) : {};

        // Ajout de la documentation de l'endpoint
        swaggerDoc.paths[doc.fullPath][httpMethod] = {
            tags: doc.tags,
            description: doc.description,
            parameters,
            responses
        };

        // Écriture dans le fichier
        writeFileSync(outputFile, JSON.stringify(swaggerDoc, null, 2), 'utf8');
    };
}