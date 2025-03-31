import {AppDataSource} from "../datasource";
import {MileageEntry} from "../entity/mileage-entry.entity";

export const MileageEntryRepository = AppDataSource.getRepository(MileageEntry).extend({
})
