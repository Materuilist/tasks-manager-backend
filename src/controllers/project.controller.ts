import { RequestHandler } from "express";

import Task from "../model/task.model";
import Project from "../model/project.model";
import UserProjectRole from "../model/user-project-role.model";
import Error from "../entities/shared/error";
import { UserRoleEnum } from "../constants/user.role.eumn";

export const getProjects: RequestHandler = async (req, res, next) => {
    const { user } = req.body;

    const projects = await Project.findAll({
        include: [
            {
                model: UserProjectRole,
                as: "usersRoles",
                attributes: ["userId"],
                where: {
                    userId: user.id,
                },
            },
        ],
    });

    return res.status(200).json(projects);
};

export const createProject: RequestHandler = async (req, res, next) => {
    const { user, title, description } = req.body;

    if (!title) {
        return next(new Error(400, "Требуется ввести название проекта!"));
    }

    const project = await Project.create({ title, description });
    await UserProjectRole.create({
        projectId: project.id,
        roleId: UserRoleEnum.rp,
        userId: user.id,
    });

    return res
        .status(201)
        .json({ message: `Проект "${title}" успешно создан.`, project });
};
