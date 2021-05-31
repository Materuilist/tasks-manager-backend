import { RequestHandler } from "express";
import { literal, Op } from "sequelize";

import Project from "../model/project.model";
import UserProjectRole from "../model/user-project-role.model";
import Error from "../entities/shared/error";
import { getUserRoleName, UserRoleEnum } from "../constants/user.role.eumn";
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
    const { user: currentUser, teamMembers, projectId } = req.body;

    if (typeof projectId !== "number") {
        return next(new Error(400, "Не указан проект!"));
    }

    const projectExists = Boolean(await Project.findByPk(projectId));
    if (!projectExists) {
        return next(new Error(404, "Проект не найден!"));
    }

    const areTeamMembersFilledRight = teamMembers.reduce(
        (allMembersAreOk, member) => allMembersAreOk && isTeamMemberDTO(member),
        true
    );
    if (!areTeamMembersFilledRight) {
        return next(new Error(400, "Неправильно заполнены участники команды!"));
    }

    const currentTeam = await UserProjectRole.findAll({
        where: {
            projectId,
        },
        include: {
            model: User,
            as: "user",
            attributes: ["id", "login"],
        },
    });

    const isUserProjectOwner = Boolean(
        currentTeam.find(
            (teamMember) =>
                teamMember.roleId === UserRoleEnum.rp &&
                (teamMember as any).user.id === currentUser.id
        )
    );
    if (!isUserProjectOwner) {
        return next(
            new Error(
                400,
                "Текущий пользователь не является руководителем проекта и не имеет прав изменять команду!"
            )
        );
    }

    const teamMembersErrorText = await Promise.all(
        teamMembers.map(async (member) => {
            let memberErrorsText = "";

            const userWithSameNickname = await User.findOne({
                where: {
                    login: member.login,
                },
            });

            if (member.createNew) {
                if (userWithSameNickname) {
                    memberErrorsText += `Создаваемый пользователь "${member.login}" должен иметь уникальный логин!\n`;
                }
                if (
                    typeof member.password !== "string" ||
                    !member.password.length
                ) {
                    memberErrorsText += `Создаваемый пользователь "${member.login}" должен иметь пароль!\n`;
                }
            } else {
                if (!userWithSameNickname) {
                    memberErrorsText += `Нет пользователя с логином ${member.login}, хотя он не указан как создаваемый!\n`;
                }
            }

            if (member.roleId === UserRoleEnum.rp) {
                memberErrorsText += `Попытка присвоить пользователю ${member.login} роль руководителя проекта!\n`;
            }

            const isTryingToDowngradeRp = Boolean(
                currentTeam.find(
                    (oldMember) =>
                        oldMember.roleId === UserRoleEnum.rp &&
                        (oldMember as any).user.login === member.login &&
                        member.roleId !== UserRoleEnum.rp
                )
            );
            if (isTryingToDowngradeRp) {
                memberErrorsText += `Попытка понизить руководителя проекта ${member.login}!\n`;
            }

            const isTryingToAddMultipleSameLoginUsers =
                teamMembers.filter(
                    (newMember) => newMember.login === member.login
                ).length > 1;
            if (isTryingToAddMultipleSameLoginUsers) {
                memberErrorsText += `Логин ${member.login} повторяется!\n`;
            }

            return memberErrorsText;
        })
    ).then((errorTexts) => errorTexts.join(""));
    if (teamMembersErrorText) {
        return next(new Error(400, teamMembersErrorText));
    }

    const newTeam = await Promise.all(
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

    const usersIdsToDelete = currentTeam
        .filter(
            (teamMember) =>
                teamMember.roleId !== UserRoleEnum.rp &&
                !teamMembers.some(
                    (actualMember) =>
                        actualMember.login === (teamMember as any).user.login
                )
        )
        .map(({ userId }) => userId);

    usersIdsToDelete.length &&
        (await UserProjectRole.destroy({
            where: {
                userId: {
                    [Op.in]: usersIdsToDelete,
                },
            },
        }));

    res.status(200).json({
        newTeam,
    });
};
