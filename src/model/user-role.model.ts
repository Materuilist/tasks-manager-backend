import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";
import UserProjectRole from "./user-project-role.model";

interface UserRoleAttributes {
    id: number;
    name: string;
}

interface UserRoleInstance
    extends Model<UserRoleAttributes>,
        UserRoleAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const UserRole = sequalize.define<UserRoleInstance>("UserRole", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

UserRole.hasMany(UserProjectRole, {
    sourceKey: "id",
    foreignKey: "roleId",
    as: "userProjectRoles",
});

UserProjectRole.belongsTo(UserRole, {
    foreignKey: "roleId",
    as: "role",
});

export default UserRole;
