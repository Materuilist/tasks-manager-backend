import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";

interface TaskFileAttributes {
    id: number;
    data: string;
    ownerTaskId: number;
}

interface TaskFileCreationAttributes
    extends Optional<TaskFileAttributes, "id"> {}

interface TaskFileInstance
    extends Model<TaskFileAttributes, TaskFileCreationAttributes>,
        TaskFileAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

const TaskFile = sequalize.define<TaskFileInstance>("TaskFile", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    data: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ownerTaskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default TaskFile;
