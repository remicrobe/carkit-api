import {AutoDoc, Controller, Error, Get} from "../../decorators";
import {Request, Response} from "express";
import {ErrorHandler} from "../../utils/error/error-handler";

@Controller('status')
export default class StatusController {

    @Get('/')
    @Error()
    @AutoDoc({
        tags: ['Status'],
        httpMethod: 'GET',
        description: 'Return "i\'m up".',
        fullPath: '/status/',
        parameters: [],
        responses: [
            { code: 200, exemple: { status: "I'm up !" } },
        ]
    })
    public async getStatus(req: Request, res: Response) {
        try {
            return res.send({ status: "I'm up !"});
        } catch (e) {
            return ErrorHandler(e, req, res);
        }
    }
}