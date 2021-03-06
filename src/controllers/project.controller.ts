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
        return next(new Error(400, "?????????????????? ???????????? ???????????????? ??????????????!"));
    }

    const project = await Project.create({ title, description });
    await UserProjectRole.create({
        projectId: project.id,
        roleId: UserRoleEnum.rp,
        userId: user.id,
    });

    return res
        .status(201)
        .json({ message: `???????????? "${title}" ?????????????? ????????????.`, project });
};

export const setTeam: RequestHandler<
    unknown,
    unknown,
    { user; teamMembers: TeamMemberDTO[]; projectId: number }
> = async (req, res, next) => {
    const { user: currentUser, teamMembers, projectId } = req.body;

    if (typeof projectId !== "number") {
        return next(new Error(400, "???? ???????????? ????????????!"));
    }

    const projectExists = Boolean(await Project.findByPk(projectId));
    if (!projectExists) {
        return next(new Error(404, "???????????? ???? ????????????!"));
    }

    const areTeamMembersFilledRight = teamMembers.reduce(
        (allMembersAreOk, member) => allMembersAreOk && isTeamMemberDTO(member),
        true
    );
    if (!areTeamMembersFilledRight) {
        return next(new Error(400, "?????????????????????? ?????????????????? ?????????????????? ??????????????!"));
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
                "?????????????? ???????????????????????? ???? ???????????????? ?????????????????????????? ?????????????? ?? ???? ?????????? ???????? ???????????????? ??????????????!"
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
                    memberErrorsText += `?????????????????????? ???????????????????????? "${member.login}" ???????????? ?????????? ???????????????????? ??????????!\n`;
                }
                if (
                    typeof member.password !== "string" ||
                    !member.password.length
                ) {
                    memberErrorsText += `?????????????????????? ???????????????????????? "${member.login}" ???????????? ?????????? ????????????!\n`;
                }
            } else {
                if (!userWithSameNickname) {
                    memberErrorsText += `?????? ???????????????????????? ?? ?????????????? ${member.login}, ???????? ???? ???? ???????????? ?????? ??????????????????????!\n`;
                }
            }

            if (member.roleId === UserRoleEnum.rp) {
                memberErrorsText += `?????????????? ?????????????????? ???????????????????????? ${member.login} ???????? ???????????????????????? ??????????????!\n`;
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
                memberErrorsText += `?????????????? ???????????????? ???????????????????????? ?????????????? ${member.login}!\n`;
            }

            const isTryingToAddMultipleSameLoginUsers =
                teamMembers.filter(
                    (newMember) => newMember.login === member.login
                ).length > 1;
            if (isTryingToAddMultipleSameLoginUsers) {
                memberErrorsText += `?????????? ${member.login} ??????????????????????!\n`;
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
