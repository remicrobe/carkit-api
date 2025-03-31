import {AppDataSource} from "../datasource";
import {Part} from "../entity/part.entity";

export const PartRepository = AppDataSource.getRepository(Part).extend({
})
