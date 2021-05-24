import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";
import Task from "./task.model";

interface TaskStatusAttributes {
    id: number;
    name: string;
}

interface TaskStatusCreationAttributes
    extends Optional<TaskStatusAttributes, "id"> {}

interface TaskStatusInstance
    extends Model<TaskStatusAttributes, TaskStatusCreationAttributes>,
        TaskStatusAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const TaskStatus = sequalize.define<TaskStatusInstance>("TaskStatus", {
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

TaskStatus.hasMany(Task, {
    sourceKey: "id",
    foreignKey: "statusId",
    as: "tasks",
});

Task.belongsTo(TaskStatus, {
    foreignKey: "statusId",
    as: "status",
});

export default TaskStatus;
