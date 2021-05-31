import { RequestHandler } from "express";
import { Op } from "sequelize";

import UserProjectRole from "../model/user-project-role.model";
import { UserRoleEnum } from "../constants/user.role.eumn";
import { isNewTaskDTO, NewTaskDTO } from "../entities/dto-in/new-task.dto";
import {
    isUpdateTaskDTO,
    UpdateTaskDTO,
} from "../entities/dto-in/update-task.dto";
import Error from "../entities/shared/error";
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
            parentTaskId: null
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

export const getProjectTasks: RequestHandler = async (req, res, next) => {
    const { user: currentUser } = req.body;
    const { projectId } = req.params;

    if (!projectId) {
        return next(new Error(400, "Не указан проект!"));
    }
    const isAllowedToView = Boolean(
        await UserProjectRole.findOne({
            where: {
                projectId,
                userId: currentUser.id,
            },
        })
    );

    if (!isAllowedToView) {
        return next(
            new Error(401, "Данный проект не доступен текущему пользователю!")
        );
    }

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
            projectId,
            parentTaskId: null
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

export const createTask: RequestHandler<
    unknown,
    unknown,
    { user; task: NewTaskDTO; projectId: number }
> = async (req, res, next) => {
    const { user: currentUser, task, projectId } = req.body;

    if (typeof projectId !== "number") {
        return next(new Error(400, "Не указан проект!"));
    }

    if (!isNewTaskDTO(task)) {
        return next(new Error(400, "Неверный формат задания!"));
    }

    const isUserAllowedToManageTasks =
        (
            await UserProjectRole.findAll({
                where: {
                    userId: currentUser.id,
                    projectId,
                    roleId: {
                        [Op.in]: [UserRoleEnum.rp, UserRoleEnum.manager],
                    },
                },
            })
        ).length !== 0;

    if (!isUserAllowedToManageTasks) {
        return next(
            new Error(
                401,
                "Текущему пользователю не разрешено создавать задачи на данном проекте!"
            )
        );
    }

    const sameTitleTaskExists = Boolean(
        await Task.findOne({
            where: { title: task.title, projectId },
        })
    );
    if (sameTitleTaskExists) {
        return next(
            new Error(
                400,
                "Задача с таким названием существует на данном проекте!"
            )
        );
    }

    const responsibleUserFits =
        !task.responsibleUserId ||
        Boolean(
            await UserProjectRole.findOne({
                where: {
                    userId: task.responsibleUserId,
                    projectId,
                    roleId: UserRoleEnum.executor,
                },
            })
        );
    if (!responsibleUserFits) {
        return next(
            new Error(404, "На этом проекте нет указанного исполнителя!")
        );
    }

    const createdTask = await Task.create({
        title: task.title,
        description: task.description ?? "",
        maxEnd: task.maxEnd,
        maxStart: task.maxStart,
        priorityId: task.priorityId,
        statusId: task.statusId,
        projectId,
        hoursSpent: 0,
        minEnd: task.minEnd ?? null,
        minStart: task.minEnd ?? null,
        parentTaskId: task.parentTaskId ?? null,
        responsibleUserId: task.responsibleUserId ?? null,
    });

    res.status(201).json({ createdTask });
};

export const updateTask: RequestHandler<
    unknown,
    unknown,
    { user; task: UpdateTaskDTO }
> = async (req, res, next) => {
    const { user: currentUser, task } = req.body;

    if (!isUpdateTaskDTO(task)) {
        return next(new Error(400, "Неверный формат задания!"));
    }

    const oldTask = await Task.findOne({
        where: { id: task.id },
    });

    if (!oldTask) {
        return next(new Error(404, "Задачи с таким идентификатором нет!"));
    }

    const hasAllUpdateRights = Boolean(
        await UserProjectRole.findOne({
            where: {
                roleId: { [Op.in]: [UserRoleEnum.rp, UserRoleEnum.manager] },
                projectId: oldTask.projectId,
                userId: currentUser.id,
            },
        })
    );
    const hasOnlyExecutorRights =
        !hasAllUpdateRights && oldTask.responsibleUserId === currentUser.id;

    if (!hasAllUpdateRights && !hasOnlyExecutorRights) {
        return next(new Error(401, "Нет прав обновления данной задачи"));
    }

    await Task.update(hasAllUpdateRights ? task : { statusId: task.statusId }, {
        where: {
            id: task.id,
        },
    });

    res.status(200).json({ message: "Обновление прошло успешно!" });
};
