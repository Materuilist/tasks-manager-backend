import Error from "../entities/shared/error";
import User from "../model/user.model";
import Encrypter from "../services/encrypter";
import TokenProcessor from "../services/tokenProcessor";

export const signUp = async (req, res, next) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return next(new Error(400, "Введены не все данные"));
    }

    const sameLoginUsers = await User.findAll({ where: { login } });
    if (sameLoginUsers.length !== 0) {
        return next(
            new Error(400, "Пользователь с таким логином уже существует!")
        );
    }

    await User.create({
        login,
        password: await Encrypter.hash(password)
    });

    res.status(201).json({
        message: "Регистрация прошла успешно!",
        token: await TokenProcessor.getToken(login),
    });
};

export const signIn = async (req, res, next) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return next(new Error(400, "Введены не все данные"));
    }

    const user = await User.findOne({ where: { login } });
    if (!user) {
        return next(new Error(404, "Пользователя с таким логином нет!"));
    }

    const doPasswordsMatch = await Encrypter.verify(password, user.password);
    if (!doPasswordsMatch) {
        return next(new Error(400, "Неверный пароль!"));
    }

    res.status(200).json({
        message: "Вход прошел успешно!",
        token: await TokenProcessor.getToken(login),
    });
};

export const getUser = async (req, res, next) => {
    const { user } = req.body;
    
    res.status(200).json({ userInfo: { login: user.login } });
};
