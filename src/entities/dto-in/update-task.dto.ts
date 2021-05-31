import isDateValid from "../../utils/isDateValid";

export interface UpdateTaskDTO {
    id: number;
    description?: string;
    minStart?: Date;
    maxStart: Date;
    minEnd?: Date;
    maxEnd: Date;
    responsibleUserId?: number;
    statusId: number;
    priorityId: number;
}

export const isUpdateTaskDTO = (object) => {
    return (
        typeof object.id === 'number' &&
        isDateValid(new Date(object.maxStart)) &&
        isDateValid(new Date(object.maxEnd)) &&
        typeof object.statusId === "number" &&
        typeof object.priorityId === "number"
    );
};
