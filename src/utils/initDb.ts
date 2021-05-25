import TaskPriority from "../model/task-priority.model";
import Project from "../model/project.model";
import Task from "../model/task.model";
import TaskStatus from "../model/task-status.model";
import UserRole from "../model/user-role.model";
import sequalize from "./database";
import User from "../model/user.model";
import Encrypter from "../services/encrypter";
import UserProjectRole from "../model/user-project-role.model";

export default async (deleteAllDbs = false, createTestData = false) => {
    if (deleteAllDbs) {
        await sequalize.dropAllSchemas({});
        await sequalize.sync();
    }
    /* *************** dictionaries *************** */
    TaskPriority.bulkCreate([
        {
            name: "Критический",
        },
        {
            name: "Высокий",
        },
        {
            name: "Основной",
        },
        {
            name: "Низкий",
        },
    ]);

    TaskStatus.bulkCreate([
        {
            name: "Новая",
        },
        {
            name: "В работе",
        },
        {
            name: "Решена",
        },
        {
            name: "Приостановлена",
        },
        {
            name: "Закрыта",
        },
    ]);

    UserRole.bulkCreate([
        {
            name: "Руководитель проекта",
        },
        {
            name: "Менеджер",
        },
        {
            name: "Аналитик",
        },
        {
            name: "Разработчик",
        },
        {
            name: "Дизайнер",
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
        {
            title: "test proj 2",
            description: "about test proj 2",
        },
    ]);

    UserProjectRole.bulkCreate([
        {
            projectId: 1,
            roleId: 3,
            userId: 1,
        },
        {
            projectId: 1,
            roleId:4,
            userId: 2,
        },
    ]);

    Task.bulkCreate([
        {
            title: "Создать проект",
            description: "Создание проекта",
            maxStart: new Date(),
            maxEnd: new Date("2021-06-07"),
            priorityId: 1,
            projectId: 1,
            statusId: 1,
            responsibleUserId: 1,
        },
        {
            title: "Развить проект",
            description: "Развитие проекта",
            maxStart: new Date("2021-06-08"),
            maxEnd: new Date("2021-06-10"),
            priorityId: 1,
            projectId: 2,
            statusId: 3,
            responsibleUserId: 2,
        },
    ]);
};
