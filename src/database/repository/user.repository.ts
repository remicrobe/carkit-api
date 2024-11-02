import {AppDataSource} from "../datasource";
import {User} from "../entity/user.entity";
import {Equal} from "typeorm";
import {createHash, randomUUID} from "crypto";

export const UserRepository = AppDataSource.getRepository(User).extend({
    createUser(email: string, password: string, provider: string, isGuest: boolean = false) {
        let user = new User();
        user.email = email
        user.password = password
        user.provider = provider
        user.isGuest = isGuest
        return user;
    },
})
