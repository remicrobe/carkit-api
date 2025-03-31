import * as path from "node:path";

export const Controller = (basePath: string | null = null): ClassDecorator => {
    return (target) => {
        // This, is for the url parts.
        let basePathToUse: string = '';

        if (basePath) {
            basePathToUse += basePath.startsWith('/') ? basePath : `/${basePath}`;
        }

        // @ts-ignore
        Reflect.defineMetadata('base_path', `${basePathToUse}`, target);

        // This, is for the folder parts.
        const callerPath = (new Error()).stack?.split('\n')[4] ?? '';
        const filePathMatch = callerPath.match(/\((.*):\d+:\d+\)$/) || callerPath.match(/at (.*):\d+:\d+$/);
        const filePath = filePathMatch ? filePathMatch[1] : '';

        const projectRoot = path.resolve(__dirname, '../controllers/api/');
        const relativePath = path.relative(projectRoot, filePath);

        const folders = relativePath.split(path.sep);
        folders.pop();
        const corePage = folders.join('_').toLowerCase();

        Reflect.defineMetadata('core_page', corePage, target);
    }
}