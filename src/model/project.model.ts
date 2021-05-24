import { DataTypes, Model, Optional } from "sequelize";

import sequalize from "../utils/database";

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

export default Project;
