/// ColumnNumericTransformer
export class ColumnMagicLinkTransformer {
    to(data: any): any {
        return data;
    }
    from(data: string): string {
        if(!data) {
            return
        }
        return "https://join.carkit-app.fr/carkit/" + data;
    }
}