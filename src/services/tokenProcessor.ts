import { sign, verify, decode } from "jsonwebtoken";

export default class {
    static async getToken(login: string) {
        return await sign({ login }, "borowisimo", {
            expiresIn: "2h",
        });
    }

    static async verifyToken(token: string) {
        try {
            await verify(token, "borowisimo");
            return true;
        } catch {
            return false;
        }
    }

    static async decodeToken(token: string) {
        try {
            const userPayload = await decode(token);
            return userPayload as { login: string };
        } catch {
            return null;
        }
    }
}
