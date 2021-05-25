export const enum UserRoleEnum {
    rp = 1,
    manager = 2,
    executor = 3,
}

export const getUserRoleName = (userRoleId: UserRoleEnum) => {
    const names = ["Руководитель проекта", "Менеджер", "Исполнитель"];

    return names[userRoleId - 1];
};
