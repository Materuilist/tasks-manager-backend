import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";
import UserProjectRole from "./user-project-role.model";

interface UserRoleAttributes {
    id: number;
    name: string;
}

interface UserRoleCreationAttributes
    extends Optional<UserRoleAttributes, "id"> {}

interface UserRoleInstance
    extends Model<UserRoleAttributes, UserRoleCreationAttributes>,
        UserRoleAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const UserRole = sequalize.define<UserRoleInstance>("user", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
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
