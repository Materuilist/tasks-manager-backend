import { compare, hash } from "bcrypt";

export default class {
    constructor() {}

    static async hash(value: string) {
        return await hash(value, 12);
    }

    static async verify(value: string, encrypted: string) {
        return await compare(value, encrypted);
    }
}
