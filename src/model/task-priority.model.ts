import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";

interface TaskPriorityAttributes {
    id: number;
    name: string;
}

interface TaskPriorityCreationAttributes
    extends Optional<TaskPriorityAttributes, "id"> {}

interface TaskPriorityInstance
    extends Model<TaskPriorityAttributes, TaskPriorityCreationAttributes>,
        TaskPriorityAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const TaskPriority = sequalize.define<TaskPriorityInstance>("TaskPriority", {
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

export default TaskPriority;
