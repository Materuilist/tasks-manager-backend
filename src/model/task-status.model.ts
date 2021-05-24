import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";

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
    }
});

export default TaskStatus;
