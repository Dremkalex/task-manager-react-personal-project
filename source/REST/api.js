import { MAIN_URL, TOKEN } from './config';

export const api = {
    async fetchTasks () {
        const tasks = await fetch(MAIN_URL, {
            method:  'GET',
            headers: {
                Authorization: TOKEN,
            },
        })
            .then((response) => response.json())
            .then(({ data }) => data)
            .catch((error) => console.log('error', error));

        return tasks;
    },

    async createTask (message) {
        const task = await fetch(MAIN_URL, {
            method:  'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization:  TOKEN,
            },
            body: JSON.stringify({ message }),
        })
            .then((response) => response.json())
            .then(({ data }) => data)
            .catch((error) => console.log('error', error));

        return task;
    },

    async removeTask (id) {
        await fetch(`${MAIN_URL}/${id}`, {
            method:  'DELETE',
            headers: {
                Authorization: TOKEN,
            },
        })
            .then((response) => response.json())
            .then(({ data }) => data)
            .catch((error) => console.log('error', error));
    },

    async updateTask (updatedTask) {
        const newTask = await fetch(MAIN_URL, {
            method:  'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization:  TOKEN,
            },
            body: JSON.stringify([updatedTask]),
        })
            .then((response) => response.json())
            .then(({ data: [task] }) => task)
            .catch((error) => console.log('error', error));

        return newTask;
    },

    async completeAllTasks (notCompletedTasks) {
        const completedTasks = await Promise.all(
            notCompletedTasks.map((task) => {
                task.completed = true;

                return api.updateTask(task);
            }))
            .then(({ data }) => data)
            .catch((error) => console.log('error', error));

        return completedTasks;
    },
};
