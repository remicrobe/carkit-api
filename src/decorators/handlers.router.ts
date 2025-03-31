export enum Methods {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

export interface IRouter {
    method: Methods,
    path: string,
    handlerName: string | symbol
}

const methodDecoratorFactory = (method: Methods) => {
    return (path: string): MethodDecorator => {
        return (target, propertyKey) => {
            const controllerClass = target.constructor;

            // @ts-ignore
            const routers: IRouter[] = Reflect.hasMetadata('routers', controllerClass) ? Reflect.getMetadata('routers', controllerClass) : [];

            routers.push({
                method,
                path,
                handlerName: propertyKey
            });

            // @ts-ignore
            Reflect.defineMetadata('routers', routers, controllerClass);
        }
    }
}

export const Get = methodDecoratorFactory(Methods.GET);
export const Post = methodDecoratorFactory(Methods.POST);
export const Put = methodDecoratorFactory(Methods.PUT);
export const Delete = methodDecoratorFactory(Methods.DELETE);