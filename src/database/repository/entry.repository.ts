import {AppDataSource} from "../datasource";
import {Entry} from "../entity/entry.entity";

export const EntryRepository = AppDataSource.getRepository(Entry).extend({
})
