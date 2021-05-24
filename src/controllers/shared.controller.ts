import Error from "../entities/shared/error";
import User from "../model/user.model";
import TokenProcessor from "../services/tokenProcessor";

export const parseUser = async (req, res, next) => {
    if (!req.headers.authorization) {
        return next(new Error(401, "Ошибка при получении пользователя!"));
    }
    const token = req.headers.authorization.split(" ")[1];
    const { login } = await TokenProcessor.decodeToken(token);
    const user = await User.findOne({ where: { login } });

    if (!user) {
        return next(new Error(401, "Ошибка при получении пользователя!"));
    }

    req.body.user = user;
    next();
};
