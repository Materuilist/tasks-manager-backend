import { RequestHandler } from "express";

export const getAuth: RequestHandler = async (req, res, next) => {
    return res.render('auth');
};
