export const enum TaskPriorityEnum {
    critical = 1,
    high = 2,
    main = 3,
    low = 4,
}

export const getTaskPriorityName = (taskPriorityId: TaskPriorityEnum) => {
    const names = ["Критический", "Высокий", "Основной", "Низкий"];

    return names[taskPriorityId - 1];
};
