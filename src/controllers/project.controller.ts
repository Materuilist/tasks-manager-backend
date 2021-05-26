import { RequestHandler } from "express";
import { literal } from "sequelize";

import Project from "../model/project.model";
import UserProjectRole from "../model/user-project-role.model";
import Error from "../entities/shared/error";
import { UserRoleEnum } from "../constants/user.role.eumn";
import UserRole from "../model/user-role.model";
import User from "../model/user.model";
import {
    isTeamMemberDTO,
    TeamMemberDTO,
} from "../entities/dto-in/team-member.dto";
import Encrypter from "../services/encrypter";

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

export const setTeam: RequestHandler<
    unknown,
    unknown,
    { user; teamMembers: TeamMemberDTO[]; projectId: number }
> = async (req, res, next) => {
    let { user: currentUser, teamMembers, projectId } = req.body;

    if (typeof projectId !== "number") {
        return next(new Error(400, "Не указан проект!"));
    }

    const projectExists = Boolean(await Project.findByPk(projectId));
    if(!projectExists){
        return next(new Error(404, 'Проект не найден!'))
    }

    const areTeamMembersFilledRight = teamMembers.reduce(
        (allMembersAreOk, member) => allMembersAreOk && isTeamMemberDTO(member),
        true
    );
    if (!areTeamMembersFilledRight) {
        return next(new Error(400, "Неправильно заполнены участники команды!"));
    }

    const teamMembersLoginsErrorText = await Promise.all(
        teamMembers.map(async (member) => {
            const userWithSameNickname = await User.findOne({
                where: {
                    login: member.login,
                },
            });

            if (member.createNew) {
                if (userWithSameNickname) {
                    return `Создаваемый пользователь "${member.login}" должен иметь уникальный логин!\n`;
                }
                if (
                    typeof member.password !== "string" ||
                    !member.password.length
                ) {
                    return `Создаваемый пользователь "${member.login}" должен иметь пароль!\n`;
                }
            } else {
                if (!userWithSameNickname) {
                    return `Нет пользователя с логином ${member.login}, хотя он не указан как создаваемый!\n`;
                }
            }

            return "";
        })
    ).then((errorTexts) => errorTexts.join(""));
    if (teamMembersLoginsErrorText) {
        return next(new Error(400, teamMembersLoginsErrorText));
    }

    const createdTeam = await Promise.all(
        teamMembers.map(async (member) => {
            const user = await (member.createNew
                ? User.create({
                      login: member.login,
                      password: await Encrypter.hash(member.password),
                  })
                : User.findOne({
                      where: {
                          login: member.login,
                      },
                  }));

            const userProjectRole = await UserProjectRole.findOne({
                where: {
                    projectId,
                    userId: user.id,
                },
            });

            await (userProjectRole
                ? UserProjectRole.update(
                      { roleId: member.roleId },
                      { where: { userId: user.id, projectId } }
                  )
                : UserProjectRole.create({
                      userId: user.id,
                      projectId,
                      roleId: member.roleId,
                  }));

            return user;
        })
    );

    res.status(200).json({ createdTeam });
};
