import { RequestHandler } from "express";

import Task from "../model/task.model";
import Project from "../model/project.model";
import UserProjectRole from "../model/user-project-role.model";

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
