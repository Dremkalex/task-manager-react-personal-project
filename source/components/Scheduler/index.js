// Core
import React, { Component } from 'react';
import FlipMove from 'react-flip-move';

// Components
import Spinner from 'components/Spinner';
import Task from 'components/Task';
import Checkbox from 'theme/assets/Checkbox';

// Instruments
import Styles from './styles.m.css';
import { api } from '../../REST'; // ! Импорт модуля API должен иметь именно такой вид (import { api } from '../../REST')
import { sortTasksByGroup } from '../../instruments/helpers';

export default class Scheduler extends Component {
    state = {
        newTaskMessage:  '',
        tasksFilter:     '',
        isTasksFetching: false,
        tasks:           [],
    }

    componentDidMount () {
        this._fetchTasksAsync();
    }

    _updateTasksFilter = ({ target: { value }}) => this.setState({
        tasksFilter: value.toLocaleLowerCase(),
    })

    _updateNewTaskMessage = ({ target: { value }}) => {
        this.setState({
            newTaskMessage: value,
        });
    }

    _getAllCompleted = () => {
        const { tasks } = this.state;

        return tasks.every(({ completed }) => completed);
    }

    _setTasksFetchingState = (state) => {
        this.setState({
            isTasksFetching: state,
        });
    }

    _fetchTasksAsync = async () => {
        this._setTasksFetchingState(true);

        const tasks = await api.fetchTasks();

        this.setState({ tasks: sortTasksByGroup(tasks) });

        this._setTasksFetchingState(false);
    }

    _createTaskAsync = async (event) => {
        event.preventDefault();
        const { newTaskMessage } = this.state;

        if (!newTaskMessage) {
            return null;
        }

        this._setTasksFetchingState(true);

        const task = await api.createTask(newTaskMessage);

        this.setState(({ tasks }) => ({
            tasks:          sortTasksByGroup([task, ...tasks]),
            newTaskMessage: '',
        }));

        this._setTasksFetchingState(false);
    }

    _updateTaskAsync = async (updatedTask) => {
        this._setTasksFetchingState(true);

        const newTask= await api.updateTask(updatedTask);

        this.setState(({ tasks }) => ({
            tasks: sortTasksByGroup([newTask, ...tasks.filter((task) => task.id !== updatedTask.id)]),
        }));

        this._setTasksFetchingState(false);
    }

    _removeTaskAsync = async (id) => {
        this._setTasksFetchingState(true);
        await api.removeTask(id);

        this.setState(({ tasks }) => ({
            tasks: sortTasksByGroup(tasks.filter((task) => task.id !== id)),
        }));

        this._setTasksFetchingState(false);
    }

    _completeAllTasksAsync = async () => {
        const { tasks } = this.state;

        if (this._getAllCompleted()) {
            return null;
        }

        this._setTasksFetchingState(true);

        const notCompletedTasks = tasks.filter(({ completed }) => completed === false);

        await api.completeAllTasks(notCompletedTasks);

        //не понимаю, почему после отправки запроса на сервер в этой точке уже обновляется стейт...
        this.setState({
            tasks: sortTasksByGroup(tasks.filter(({ completed }) => completed === true)),
        });

        this._setTasksFetchingState(false);
    }

    _getVisibleTasks = () => {
        const { tasksFilter, tasks } = this.state;

        return tasks.filter(({ message }) => message.toLowerCase().includes(tasksFilter.toLowerCase()));
    }

    _animateTaskEnter = () => ({
        from: { transform: 'scale(0.5, 1)', opacity: 0 },
        to:   { transform: 'scale(1, 1)', opacity: 1 },
    })

    render () {
        const { tasksFilter, newTaskMessage, isTasksFetching } = this.state;
        const isAllTasksCompleted = this._getAllCompleted();

        const visibleTasks = this._getVisibleTasks();

        const tasksJSX = visibleTasks.length ? visibleTasks.map((task) => (
            <Task
                key = { task.id }
                { ...task }
                _removeTaskAsync = { this._removeTaskAsync }
                _updateTaskAsync = { this._updateTaskAsync }
            />
        )) : null;

        return (
            <section className = { Styles.scheduler }>
                <Spinner isSpinning = { isTasksFetching } />
                <main>
                    <header>
                        <h1>Планировщик задач</h1>
                        <input
                            placeholder = 'Поиск'
                            type = 'search'
                            value = { tasksFilter }
                            onChange = { this._updateTasksFilter }
                        />
                    </header>
                    <section>
                        <form onSubmit = { this._createTaskAsync }>
                            <input
                                className = { Styles.createTask }
                                maxLength = { 50 }
                                placeholder = 'Описaние моей новой задачи'
                                type = 'text'
                                value = { newTaskMessage }
                                onChange = { this._updateNewTaskMessage }
                            />
                            <button type = 'submit'>Добавить задачу</button>
                        </form>
                        <ul>
                            <FlipMove
                                duration = { 400 }
                                easing = 'ease-in-out'
                                enterAnimation = { this._animateTaskEnter }>
                                {tasksJSX}
                            </FlipMove>
                        </ul>
                    </section>
                    <footer>
                        <Checkbox
                            inlineBlock
                            checked = { isAllTasksCompleted }
                            color1 = '#363636'
                            color2 = '#fff'
                            onClick = { this._completeAllTasksAsync }
                        />
                        <span className = { Styles.completeAllTasks }>
                            Все задачи выполнены
                        </span>
                    </footer>
                </main>
            </section>
        );
    }
}
