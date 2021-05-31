import { RequestHandler } from "express";
import TaskPriority from "../model/task-priority.model";
import TaskStatus from "../model/task-status.model";
import Task from "../model/task.model";

export const getTasks: RequestHandler = async (req, res, next) => {
    const { user: currentUser } = req.body;

    const taskAttributesToShow = [
        "id",
        "title",
        "description",
        "maxStart",
        "maxEnd",
        "statusId",
        "priorityId",
    ];
    const tasks = await Task.findAll({
        attributes: taskAttributesToShow,
        where: {
            responsibleUserId: currentUser.id,
        },
        include: [
            {
                model: Task,
                as: "childrenTasks",
                attributes: taskAttributesToShow,
            },
            {
                model: TaskStatus,
                as: "status",
                attributes: ["name"],
            },
            {
                model: TaskPriority,
                as: "priority",
                attributes: ["name"],
            },
        ],
    });

    res.status(200).json({ tasks });
};
