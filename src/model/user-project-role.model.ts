import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";

interface UserProjectRoleAttributes {
    id: number;
    userId: number;
    projectId: number;
    roleId: number;
}

interface UserProjectRoleCreationAttributes
    extends Optional<UserProjectRoleAttributes, "id"> {}

interface UserProjectRoleInstance
    extends Model<UserProjectRoleAttributes, UserProjectRoleCreationAttributes>,
        UserProjectRoleAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const UserProjectRole = sequalize.define<UserProjectRoleInstance>(
    "UserProjectRole",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: DataTypes.INTEGER,
        projectId: DataTypes.INTEGER,
        roleId: DataTypes.INTEGER,
    }
);

export default UserProjectRole;
