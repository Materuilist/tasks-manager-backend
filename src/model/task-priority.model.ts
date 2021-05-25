import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";
import Task from "./task.model";

interface TaskPriorityAttributes {
    id: number;
    name: string;
}

interface TaskPriorityInstance
    extends Model<TaskPriorityAttributes>,
        TaskPriorityAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const TaskPriority = sequalize.define<TaskPriorityInstance>("TaskPriority", {
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

TaskPriority.hasMany(Task, {
    sourceKey: "id",
    foreignKey: "priorityId",
    as: "tasks",
});

Task.belongsTo(TaskPriority, {
    foreignKey: "priorityId",
    as: "priority",
});

export default TaskPriority;
