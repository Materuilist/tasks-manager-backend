import isDateValid from "../../utils/isDateValid";

export interface NewTaskDTO {
    title: string;
    description?: string;
    minStart?: Date;
    maxStart: Date;
    minEnd?: Date;
    maxEnd: Date;
    parentTaskId?: number;
    responsibleUserId?: number;
    statusId: number;
    priorityId: number;
}

export const isNewTaskDTO = (object) => {
    return (
        typeof object.title === "string" &&
        isDateValid(new Date(object.maxStart)) &&
        isDateValid(new Date(object.maxEnd)) &&
        typeof object.statusId === "number" &&
        typeof object.priorityId === "number"
    );
};
