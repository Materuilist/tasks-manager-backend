import { RequestHandler } from "express";
import moment = require("moment");

import Project from "../model/project.model";
import TaskPriority from "../model/task-priority.model";
import TaskStatus from "../model/task-status.model";
import Task from "../model/task.model";
import User from "../model/user.model";
import Encrypter from "../services/encrypter";

const ITEMS_PER_PAGE = 10;

export const getAuth: RequestHandler = async (req, res, next) => {
    return res.render("auth");
};

export const postAuth: RequestHandler = async (req, res, next) => {
    const { login, password } = req.body;

    const user = await User.findOne({ where: { login } });
    if (!user) {
        return res.render("error", { errorMessage: "Пользователь не найден!" });
    }
    const doPasswordsMatch = await Encrypter.verify(password, user.password);
    if (!doPasswordsMatch) {
        return res.render("error", { errorMessage: "Неверный пароль!" });
    }

    return res.redirect(
        `/test-app/tasks?page=1&login=${login}&userId=${user.id}`
    );
};

export const getTasksPage: RequestHandler<
    unknown,
    unknown,
    unknown,
    { page?: number; itemsCount?: number; userId: string; login: string }
> = async (req, res, next) => {
    const { page = 1, itemsCount = ITEMS_PER_PAGE, userId, login } = req.query;

    const taskAttributesToShow = [
        "id",
        "title",
        "description",
        "maxStart",
        "maxEnd",
    ];
    const [tasks, nextPageExists] = await Promise.all([
        Task.findAll({
            attributes: taskAttributesToShow,
            where: {
                responsibleUserId: userId,
                parentTaskId: null,
            },
            include: [
                {
                    separate: true,
                    model: Task,
                    as: "childrenTasks",
                    attributes: taskAttributesToShow,
                    include: [
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
                },
                {
                    model: TaskStatus,
                    as: "status",
                    attributes: ["id", "name"],
                },
                {
                    model: TaskPriority,
                    as: "priority",
                    attributes: ["id", "name"],
                },
                {
                    model: Project,
                    as: "project",
                    attributes: ["title"],
                },
            ],
            order: [
                ["parentTaskId", "ASC"],
                ["id", "ASC"],
            ],
            offset: (page - 1) * itemsCount,
            limit: +itemsCount,
            subQuery: false,
        }),
        Task.count({ where: { parentTaskId: null } }).then(
            (tasksCount) => tasksCount > page * itemsCount
        ),
    ]);

    res.render("user-tasks", {
        tasks: tasks.map((task) => ({
            ...task.get({ plain: true }),
            maxStart: moment(task.maxStart).format("ll"),
            maxEnd: moment(task.maxEnd).format("ll"),
            childrenTasks: (task as any).childrenTasks.map((childTask) => ({
                ...childTask.get({ plain: true }),
                maxStart: moment(childTask.maxStart).format("ll"),
                maxEnd: moment(childTask.maxEnd).format("ll"),
            })),
        })),
        nextPageExists,
        userLogin: login,
        userId,
        currentPage: page,
    });
};
