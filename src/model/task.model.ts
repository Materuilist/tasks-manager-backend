import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";
import TaskFile from "./task-file";

interface TaskAttributes {
    id: number;
    title: string;
    description: string;
    hoursSpent?: number;
    minStart?: Date;
    maxStart: Date;
    minEnd?: Date;
    maxEnd: Date;
    projectId: number;
    parentTaskId?: number;
    responsibleUserId?: number;
    statusId: number;
    priorityId: number;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, "id"> {}

interface TaskInstance
    extends Model<TaskAttributes, TaskCreationAttributes>,
        TaskAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const Task = sequalize.define<TaskInstance>("Task", {
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
    description: DataTypes.TEXT,
    hoursSpent: DataTypes.INTEGER,
    minStart: DataTypes.DATE,
    maxStart: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    minEnd: DataTypes.DATE,
    maxEnd: { type: DataTypes.DATE, allowNull: false },
    projectId: DataTypes.INTEGER,
    parentTaskId: { type: DataTypes.INTEGER, allowNull: true },
    responsibleUserId: { type: DataTypes.INTEGER, allowNull: true },
    statusId: DataTypes.INTEGER,
    priorityId: DataTypes.INTEGER,
});

Task.hasMany(TaskFile, {
    sourceKey: "id",
    foreignKey: "ownerTaskId",
    as: "files",
    onDelete: "CASCADE",
});

TaskFile.belongsTo(Task, {
    foreignKey: "ownerTaskId",
    as: "ownerTask",
});

Task.hasMany(Task, {
    sourceKey: "id",
    foreignKey: "parentTaskId",
    as: "childrenTasks",
    onDelete: "CASCADE",
});

Task.belongsTo(Task, {
    foreignKey: "parentTaskId",
    as: "parentTask",
});

export default Task;
