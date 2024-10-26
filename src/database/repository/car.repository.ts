import {AppDataSource} from "../datasource";
import {Car} from "../entity/car.entity";

export const CarRepository = AppDataSource.getRepository(Car).extend({
})
