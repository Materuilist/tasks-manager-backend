import { RequestHandler } from "express";

import Project from "../model/project.model";

export const getProjects: RequestHandler = async(req, res, next) => {
    const { user } = req.body;

    const projects = await Project.findAll({ include: "tasks" })

    return res.status(200).json(projects);
};
