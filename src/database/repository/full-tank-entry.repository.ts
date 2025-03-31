import {AppDataSource} from "../datasource";
import {FullTankEntry} from "../entity/full-tank-entry.entity";

export const FullTankEntryRepository = AppDataSource.getRepository(FullTankEntry).extend({
})
