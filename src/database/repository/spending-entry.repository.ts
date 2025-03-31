import {AppDataSource} from "../datasource";
import {SpendingEntry} from "../entity/spending-entry.entity";

export const SpendingEntryRepository = AppDataSource.getRepository(SpendingEntry).extend({
})
