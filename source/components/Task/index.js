// Core
import React, { PureComponent, createRef } from 'react';
import { string, bool, func } from 'prop-types';
import cx from 'classnames';

// Components
import Checkbox from 'theme/assets/Checkbox';
import Star from 'theme/assets/Star';
import Edit from 'theme/assets/Edit';
import Remove from 'theme/assets/Remove';

// Instruments
import Styles from './styles.m.css';

export default class Task extends PureComponent {
    static propTypes = {
        _removeTaskAsync: func.isRequired,
        _updateTaskAsync: func.isRequired,
        completed:        bool.isRequired,
        favorite:         bool.isRequired,
        id:               string.isRequired,
        message:          string.isRequired,
        modified:         string,
    }

    state = {
        isTaskEditing: false,
        newMessage:    this.props.message,
    }

    taskInput = createRef();

    _setTaskEditingState = (isTaskEditing) => {
        this.setState({
            isTaskEditing,
        });

        if (isTaskEditing) {
            this.taskInput.current.focus();
        }
    }

    _getTaskShape = ({
        id = this.props.id,
        completed = this.props.completed,
        favorite = this.props.favorite,
        message = this.props.message,
    }) => ({
        id,
        completed,
        favorite,
        message,
    });

    _updateNewTaskMessage = ({ target: { value }}) => {
        this.setState({
            newMessage: value,
        });
    }

    _updateTask = () => {
        const { newMessage } = this.state;
        const { message, _updateTaskAsync } = this.props;

        this._setTaskEditingState(false);

        if (newMessage === message) {
            return null;
        }

        _updateTaskAsync(this._getTaskShape({
            message: newMessage,
        }));
    }

    _updateTaskMessageOnClick = () => {
        const { isTaskEditing } = this.state;

        if (isTaskEditing) {
            this._updateTask();

            return null;
        }

        this._setTaskEditingState(true);
    }

    _cancelUpdatingTaskMessage = () => {
        const { message } = this.props;

        this._setTaskEditingState(false);

        this.setState({
            newMessage: message,
        });
    }

    _updateTaskMessageOnKeyDown = ({ key }) => {
        const { newMessage } = this.state;

        if (!newMessage) {
            return null;
        }

        switch (key) {
            case 'Enter':
                this._updateTask();
                break;
            case 'Escape':
                this._cancelUpdatingTaskMessage();
                break;
            default:
                return null;
        }
    }

    _toggleTaskCompletedState = () => {
        const { _updateTaskAsync, completed } = this.props;

        _updateTaskAsync(this._getTaskShape({
            completed: !completed,
        }));
    }

    _toggleTaskFavoriteState = () => {
        const { _updateTaskAsync, favorite } = this.props;

        _updateTaskAsync(this._getTaskShape({
            favorite: !favorite,
        }));

    }

    _removeTask = () => {
        const { id, _removeTaskAsync } = this.props;

        _removeTaskAsync(id);
    }

    _getTaskStyles = () => {
        const { completed } = this._getTaskShape(this.props);

        return cx(Styles.task, {
            [Styles.completed]: completed,
        });
    }

    render () {
        const { isTaskEditing, newMessage } = this.state;
        const { favorite, completed } = this._getTaskShape(this.props);
        const taskStyle = this._getTaskStyles();

        return (
            <li className = { taskStyle }>
                <div className = { Styles.content }>
                    <Checkbox
                        inlineBlock
                        checked = { completed }
                        className = { Styles.toggleTaskCompletedState }
                        color1 = '#3B8EF3'
                        color2 = '#FFF'
                        onClick = { this._toggleTaskCompletedState }
                    />
                    <input
                        disabled = { !isTaskEditing }
                        maxLength = { 50 }
                        ref = { this.taskInput }
                        type = 'text'
                        value = { newMessage }
                        onChange = { this._updateNewTaskMessage }
                        onKeyDown = { this._updateTaskMessageOnKeyDown }
                    />
                </div>
                <div className = { Styles.actions }>
                    <Star
                        inlineBlock
                        checked = { favorite }
                        className = { Styles.toggleTaskFavoriteState }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        onClick = { this._toggleTaskFavoriteState }
                    />
                    <Edit
                        inlineBlock
                        checked = { isTaskEditing }
                        className = { Styles.updateTaskMessageOnClick }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        onClick = { this._updateTaskMessageOnClick }
                    />
                    <Remove
                        inlineBlock
                        className = { Styles.removeTask }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        onClick = { this._removeTask }
                    />
                </div>
            </li>);
    }
}
