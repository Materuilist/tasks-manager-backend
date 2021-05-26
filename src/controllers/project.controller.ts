import { RequestHandler } from "express";

import Task from "../model/task.model";
import Project from "../model/project.model";
import UserProjectRole from "../model/user-project-role.model";
import Error from "../entities/shared/error";
import { UserRoleEnum } from "../constants/user.role.eumn";
import UserRole from "../model/user-role.model";
import sequalize from "utils/database";
import { col, fn, literal } from "sequelize";

export const getProjects: RequestHandler = async (req, res, next) => {
    const { user } = req.body;

    const projects = await Project.findAll({
        attributes: {
            include: [
                [
                    literal(
                        "(SELECT min(tasks.maxStart) AS maxStart FROM projects JOIN tasks)"
                    ),
                    "maxStart",
                ],
                [
                    literal(
                        "(SELECT max(tasks.maxEnd) AS maxEnd FROM projects JOIN tasks)"
                    ),
                    "maxEnd",
                ],
                [
                    literal(
                        "(SELECT min(tasks.minStart) AS minStart FROM projects JOIN tasks)"
                    ),
                    "minStart",
                ],
                [
                    literal(
                        "(SELECT max(tasks.minEnd) AS minEnd FROM projects JOIN tasks)"
                    ),
                    "minEnd",
                ],
            ],
        },
        include: [
            {
                model: UserProjectRole,
                as: "usersRoles",
                attributes: ["id"],
                where: {
                    userId: user.id,
                },
                include: [
                    {
                        model: UserRole,
                        as: "role",
                        attributes: ["name"],
                    },
                ],
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
