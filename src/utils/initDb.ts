import TaskPriority from "../model/task-priority.model";
import Project from "../model/project.model";
import Task from "../model/task.model";
import TaskStatus from "../model/task-status.model";
import UserRole from "../model/user-role.model";
import sequalize from "./database";
import User from "../model/user.model";
import Encrypter from "../services/encrypter";
import UserProjectRole from "../model/user-project-role.model";
import {
    TaskPriorityEnum,
    getTaskPriorityName,
} from "../constants/task.priority.enum";
import {
    TaskStatusEnum,
    getTaskStatusName,
} from "../constants/task.status.enum";
import { UserRoleEnum, getUserRoleName } from "../constants/user.role.eumn";

export default async (deleteAllDbs = false, createTestData = false) => {
    if (deleteAllDbs) {
        await sequalize.dropAllSchemas({});
        await sequalize.sync();
    }
    /* *************** dictionaries *************** */
    TaskPriority.bulkCreate([
        {
            id: TaskPriorityEnum.critical,
            name: getTaskPriorityName(TaskPriorityEnum.critical),
        },
        {
            id: TaskPriorityEnum.high,
            name: getTaskPriorityName(TaskPriorityEnum.high),
        },
        {
            id: TaskPriorityEnum.main,
            name: getTaskPriorityName(TaskPriorityEnum.main),
        },
        {
            id: TaskPriorityEnum.low,
            name: getTaskPriorityName(TaskPriorityEnum.low),
        },
    ]);

    TaskStatus.bulkCreate([
        {
            id: TaskStatusEnum.new,
            name: getTaskStatusName(TaskStatusEnum.new),
        },
        {
            id: TaskStatusEnum.inProgress,
            name: getTaskStatusName(TaskStatusEnum.inProgress),
        },
        {
            id: TaskStatusEnum.solved,
            name: getTaskStatusName(TaskStatusEnum.solved),
        },
        {
            id: TaskStatusEnum.suspended,
            name: getTaskStatusName(TaskStatusEnum.suspended),
        },
        {
            id: TaskStatusEnum.closed,
            name: getTaskStatusName(TaskStatusEnum.closed),
        },
    ]);

    UserRole.bulkCreate([
        {
            id: UserRoleEnum.rp,
            name: getUserRoleName(UserRoleEnum.rp),
        },
        {
            id: UserRoleEnum.manager,
            name: getUserRoleName(UserRoleEnum.manager),
        },
        {
            id: UserRoleEnum.executor,
            name: getUserRoleName(UserRoleEnum.executor),
        },
    ]);
    /* *************** end dictionaries *************** */

    if (!createTestData) return;

    User.bulkCreate([
        {
            login: "borow",
            password: await Encrypter.hash("borow"),
        },
        {
            login: "materuilist",
            password: await Encrypter.hash("borow123"),
        },
    ]);

    Project.bulkCreate([
        {
            title: "test proj 1",
            description: "about test proj 1",
        },
    ]);

    UserProjectRole.bulkCreate([
        {
            projectId: 1,
            roleId: UserRoleEnum.rp,
            userId: 1,
        },
        {
            projectId: 1,
            roleId: UserRoleEnum.executor,
            userId: 2,
        },
    ]);

    Task.bulkCreate([
        {
            title: "Создать проект",
            description: "Создание проекта",
            maxStart: new Date(),
            maxEnd: new Date("2021-06-07"),
            priorityId: TaskPriorityEnum.critical,
            projectId: 1,
            statusId: TaskStatusEnum.closed,
            responsibleUserId: 2,
        },
        {
            title: "Развить проект",
            description: "Развитие проекта",
            maxStart: new Date("2021-06-08"),
            maxEnd: new Date("2021-06-10"),
            priorityId: TaskPriorityEnum.high,
            projectId: 1,
            statusId: TaskStatusEnum.inProgress,
            responsibleUserId: 2,
        },
        {
            title: "Завершить проект",
            description: "Завершение проекта",
            maxStart: new Date("2021-06-10"),
            maxEnd: new Date("2021-06-15"),
            priorityId: TaskPriorityEnum.low,
            projectId: 1,
            statusId: TaskStatusEnum.new,
            responsibleUserId: 2,
        },
        {
            title: "Придумать название проекта",
            description: "",
            maxStart: new Date("2021-06-03"),
            maxEnd: new Date("2021-06-04"),
            priorityId: TaskPriorityEnum.critical,
            projectId: 1,
            statusId: TaskStatusEnum.closed,
            responsibleUserId: 2,
            parentTaskId: 1
        },
        {
            title: "Сформировать команду",
            description: "Распределить роли между участниками команды",
            maxStart: new Date("2021-06-05"),
            maxEnd: new Date("2021-06-07"),
            priorityId: TaskPriorityEnum.critical,
            projectId: 1,
            statusId: TaskStatusEnum.closed,
            responsibleUserId: 2,
            parentTaskId: 1
        },
        {
            title: "Придумать задачи",
            description: "Расставить задачам приоритеты",
            maxStart: new Date("2021-06-08"),
            maxEnd: new Date("2021-06-08"),
            priorityId: TaskPriorityEnum.high,
            projectId: 1,
            statusId: TaskStatusEnum.closed,
            responsibleUserId: 2,
            parentTaskId: 2
        },
        {
            title: "Назначить задачи",
            description: "",
            maxStart: new Date("2021-06-09"),
            maxEnd: new Date("2021-06-10"),
            priorityId: TaskPriorityEnum.high,
            projectId: 1,
            statusId: TaskStatusEnum.inProgress,
            responsibleUserId: 2,
            parentTaskId: 2
        },
        {
            title: "Составить отчеты",
            description: "",
            maxStart: new Date("2021-06-10"),
            maxEnd: new Date("2021-06-15"),
            priorityId: TaskPriorityEnum.low,
            projectId: 1,
            statusId: TaskStatusEnum.new,
            responsibleUserId: 2,
            parentTaskId: 3
        },
    ]);
};
