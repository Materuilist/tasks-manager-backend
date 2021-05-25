export const enum TaskStatusEnum {
    new = 1,
    inProgress = 2,
    solved = 3,
    suspended = 4,
    closed = 5,
}

export const getTaskStatusName = (taskStatusId: TaskStatusEnum) => {
    const names = ["Новая", "В работе", "Решена", "Приостановлена", "Закрыта"];

    return names[taskStatusId - 1];
};
