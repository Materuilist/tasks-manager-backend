export interface TeamMemberDTO {
    login: string;
    roleId: number;
    createNew?: boolean;
    password?: string;
}

export const isTeamMemberDTO = (object) => {
    return (
        typeof object.login === "string" && typeof object.roleId === "number"
    );
};
