import { Controller, Get, Post, Put, Delete, Error, AutoDoc, CheckJwt } from "../../decorators";
import { Request, Response } from "express";
import { User } from "../../database/entity/user.entity";
import { checkRequiredField, statusMsg } from "../../utils/global";
import { createHash } from "crypto";
import { Equal } from "typeorm";
import { ErrorHandler } from "../../utils/error/error-handler";
import { UserRepository } from "../../database/repository/user.repository";
import { verifyJwt } from "../../utils/jwt/verify";
import { generateJwt } from "../../utils/jwt/generate";
import { ColumnImageTransformer } from "../../database/transformer/ColumnImageTransformer";
import { base64tojpeg } from "../../utils/image/base64tojpeg";
import { deleteImage } from "../../storage/deleteImage";

@Controller('user')
export default class UserController {

    @Get('/me')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['User'],
        httpMethod: 'GET',
        description: 'Get all information of the connected user.',
        fullPath: '/user/me',
        parameters: [],
        responses: [
            { code: 200, exemple: { desc: 'fullUser' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } }
        ]
    })
    public async getMe(req: Request, res: Response) {
        try {
            const user: User = res.locals.connectedUser;
            return res.send(user);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Delete('/')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['User'],
        httpMethod: 'DELETE',
        description: 'Delete an User.',
        fullPath: '/user/',
        parameters: [],
        responses: [
            { code: 200, exemple: { status: 200, msg: 'User bien supprimé' } },
            { code: 401, exemple: { status: 401, msg: 'Unauthorized.' } }
        ]
    })
    public async deleteUser(req: Request, res: Response) {
        try {
            const user: User = res.locals.connectedUser;
            user.deletedAt = new Date();
            user.isDeleted = true;

            await UserRepository.save(user);

            return res.send(statusMsg(200, 'User bien supprimé'));
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Post('/register')
    @Error()
    @AutoDoc({
        tags: ['User'],
        httpMethod: 'POST',
        description: 'Register a new user.',
        fullPath: '/user/register',
        parameters: [
            {
                body: {
                    required: true,
                    description: 'User registration data',
                    exemple: { email: 'user@example.com', password: 'Password123', image: 'base64ImageString' }
                }
            }
        ],
        responses: [
            { code: 200, exemple: { /* Exemple: user data + token et refreshToken */ } }
        ]
    })
    public async register(req: Request, res: Response) {
        try {
            const { email, password, image } = req.body;

            if (!checkRequiredField([
                { type: 'mail', object: email },
                { type: 'password', object: password }
            ])) {
                return res.sendStatus(422);
            }

            let user = UserRepository.createUser(
                email,
                createHash('sha256').update(password).digest('hex'),
                "carkit_api",
                false
            );

            if (image) {
                user.imageLink = await base64tojpeg(image, { height: 400, width: 400 });
            }

            const createdUser = await UserRepository.save(user);

            if (image) {
                if (user.imageLink) {
                    await deleteImage(user.imageLink);
                }
                user.imageLink = new ColumnImageTransformer().from(user.imageLink);
            }

            return res.send({
                ...createdUser,
                token: generateJwt("token", createdUser.id),
                refreshToken: generateJwt("refreshToken", createdUser.id)
            });
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Put('/update')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['User'],
        httpMethod: 'PUT',
        description: 'Update user details.',
        fullPath: '/user/update',
        parameters: [
            {
                body: {
                    required: true,
                    description: 'User update data',
                    exemple: { email: 'new@example.com', firstName: 'John', lastName: 'Doe', password: 'newPass', username: 'johndoe', image: 'base64ImageString' }
                }
            }
        ],
        responses: [
            { code: 200, exemple: { /* Exemple de user mis à jour */ } },
            { code: 404, exemple: { status: 404, msg: 'User not found.' } },
            { code: 422, exemple: { status: 422, msg: 'Required fields missing.' } }
        ]
    })
    public async update(req: Request, res: Response) {
        try {
            const { email, firstName, lastName, password, username, image } = req.body;
            const user: User = res.locals.connectedUser;

            if (email && checkRequiredField([{ type: 'mail', object: email }])) {
                user.email = email;
            }
            if (password && checkRequiredField([{ type: 'password', object: password }])) {
                user.password = createHash('sha256').update(password).digest('hex');
            }
            if (image) {
                user.imageLink = await base64tojpeg(image, { height: 400, width: 400 });
            }

            const updatedUser = await UserRepository.save(user);

            if (image) {
                user.imageLink = new ColumnImageTransformer().from(user.imageLink);
            }

            return res.send(updatedUser);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Delete('/image')
    @CheckJwt()
    @Error()
    @AutoDoc({
        tags: ['User'],
        httpMethod: 'DELETE',
        description: 'Delete user image.',
        fullPath: '/user/image',
        parameters: [],
        responses: [
            { code: 200, exemple: { /* Exemple de user mis à jour */ } },
            { code: 404, exemple: { status: 404, msg: 'User not found.' } },
            { code: 422, exemple: { status: 422, msg: 'Required fields missing.' } }
        ]
    })
    public async deleteImage(req: Request, res: Response) {
        try {
            let user: User = res.locals.connectedUser;

            if (user.imageLink) {
                await deleteImage(user.imageLink);
                user.imageLink = null;
                user = await UserRepository.save(user);
            }

            return res.send(user);
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Post('/login')
    @Error()
    @AutoDoc({
        tags: ['User'],
        httpMethod: 'POST',
        description: 'User login.',
        fullPath: '/user/login',
        parameters: [
            {
                body: {
                    required: true,
                    description: 'User login data',
                    exemple: { email: 'user@example.com', password: 'Password123' }
                }
            }
        ],
        responses: [
            { code: 200, exemple: { /* Exemple: user data + token et refreshToken */ } }
        ]
    })
    public async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!checkRequiredField([
                { type: 'email', object: email },
                { type: 'password', object: password }
            ])) {
                return res.sendStatus(422);
            }

            const connectedUser = await UserRepository.findOneOrFail({
                where: {
                    email: Equal(email),
                    password: Equal(createHash('sha256').update(password).digest('hex')),
                    isDeleted: Equal(false)
                }
            });

            return res.send({
                ...connectedUser,
                token: generateJwt("token", connectedUser.id),
                refreshToken: generateJwt("refreshToken", connectedUser.id)
            });
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }

    @Get('/refresh-token/:refreshToken')
    @Error()
    @AutoDoc({
        tags: ['User'],
        httpMethod: 'GET',
        description: 'Refresh user token.',
        fullPath: '/user/refresh-token/{refreshToken}',
        parameters: [
            {
                path: [
                    { name: 'refreshToken', exemple: 'yourRefreshToken' }
                ]
            }
        ],
        responses: [
            { code: 200, exemple: { /* Exemple: user data + new tokens */ } },
            { code: 401, exemple: { status: 401, msg: 'Aucun token valide trouvé.' } }
        ]
    })
    public async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.params;
            if (!refreshToken) {
                return res.sendStatus(422);
            }

            const checkToken = verifyJwt('refreshToken', refreshToken);
            if (!checkToken) {
                return res.status(401).send(statusMsg(401, 'Aucun token valide trouvé'));
            }

            const collab = await UserRepository.findOneByOrFail({
                id: Equal(checkToken),
                isDeleted: Equal(false)
            });

            return res.send({
                ...collab,
                token: generateJwt("token", collab.id),
                refreshToken: generateJwt("refreshToken", collab.id)
            });
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }
}
