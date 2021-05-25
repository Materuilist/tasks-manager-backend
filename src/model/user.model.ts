import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";
import Task from "./task.model";
import UserProjectRole from "./user-project-role.model";

interface UserAttributes {
    id: number;
    login: string;
    password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

interface UserInstance
    extends Model<UserAttributes, UserCreationAttributes>,
        UserAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const User = sequalize.define<UserInstance>("User", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

User.hasMany(UserProjectRole, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "projectsRoles",
    onDelete: "CASCADE",
});

UserProjectRole.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Task, {
    sourceKey: "id",
    foreignKey: "responsibleUserId",
    as: "tasks",
});

Task.belongsTo(User, {
    foreignKey: "responsibleUserId",
    as: "responsibleUser",
});

export default User;
