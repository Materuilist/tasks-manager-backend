import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";

interface TaskAttributes {
    id: number;
    title: string;
    hoursSpent: number;
    minStart: Date;
    maxStart: Date;
    minEnd: Date;
    maxEnd: Date;
    projectId: number;
    parentTaskId: number | null;
    responsibleUserId: number;
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
    hoursSpent: DataTypes.NUMBER,
    minStart: DataTypes.DATE,
    maxStart: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    minEnd: DataTypes.DATE,
    maxEnd: { type: DataTypes.DATE, allowNull: false },
    projectId: DataTypes.NUMBER,
    parentTaskId: { type: DataTypes.NUMBER, allowNull: true },
    responsibleUserId: DataTypes.NUMBER,
    statusId: DataTypes.NUMBER,
    priorityId: DataTypes.NUMBER,
});

export default Task;
