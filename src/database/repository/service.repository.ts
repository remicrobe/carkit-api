import {AppDataSource} from "../datasource";
import {Service} from "../entity/service.entity";

export const ServiceRepository = AppDataSource.getRepository(Service).extend({
})
