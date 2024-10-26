import {AppDataSource} from "../datasource";
import {User} from "../entity/user.entity";
import {Equal} from "typeorm";
import {createHash, randomUUID} from "crypto";

export const UserRepository = AppDataSource.getRepository(User).extend({
    createUser(lastName: string, firstName: string, email: string, password: string, provider: string, isCompleted: boolean, isGuest: boolean = false) {
        let user = new User();
        user.lastName = lastName
        user.firstName = firstName
        user.email = email
        user.password = password
        user.provider = provider
        user.isCompleted = isCompleted
        user.isGuest = isGuest
        return user;
    },
})
