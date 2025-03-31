import { glob } from 'glob';
import * as path from 'node:path';

const isProduction = process.env.ENVIRONMENT === 'BUILD';
const fileExtension = isProduction ? '.js' : '.ts';

export const controllers = async () => {
    let controllersImport = [];

    const files = await glob(`${__dirname}/**/*${fileExtension}`);

    for await (const file of files) {
        if (file.toLowerCase().endsWith(fileExtension) && !file.includes(`controller${fileExtension}`)) {
            const [exportName] = file.split(fileExtension);

            let tmp = await import(path.resolve(exportName + fileExtension));

            if (tmp.default) {
                controllersImport.push(tmp);
            }
        }
    }

    return controllersImport;
};
