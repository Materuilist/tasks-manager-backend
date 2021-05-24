import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";
import Task from "./task.model";
import UserProjectRole from "./user-project-role.model";

interface ProjectAttributes {
    id: number;
    title: string;
    description: string;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, "id"> {}

interface ProjectInstance
    extends Model<ProjectAttributes, ProjectCreationAttributes>,
        ProjectAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const Project = sequalize.define<ProjectInstance>("Project", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
});

Project.hasMany(UserProjectRole, {
    sourceKey: "id",
    foreignKey: "projectId",
    as: "usersRoles",
    onDelete: "CASCADE",
});

UserProjectRole.belongsTo(Project, {
    foreignKey: "projectId",
    as: "project",
});

Project.hasMany(Task, {
    sourceKey: "id",
    foreignKey: "projectId",
    as: "tasks",
    onDelete: "CASCADE",
});

Task.belongsTo(Project, {
    foreignKey: "projectId",
    as: "project",
});

export default Project;
