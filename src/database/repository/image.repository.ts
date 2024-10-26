import {AppDataSource} from "../datasource";
import {Image} from "../entity/image.entity";

export const ImageRepository = AppDataSource.getRepository(Image).extend({
})
