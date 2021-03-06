import React, { Component } from 'react';
import { clickCell } from '../actions';

import '../styles/cell.css';

import coral from '../img/coral.png';
import clownfish from '../img/clownfish.png';

class Cell extends Component {

    render() {

        const { cell, lastClickedCell, row, column } = this.props;
        let lastClickedClass = '';

        if (lastClickedCell &&
            row === lastClickedCell.row &&
            column === lastClickedCell.column) {
            lastClickedClass = 'last-clicked';
        }
        const classNames = `cell ${cell.type} ${lastClickedClass}`;

        if (cell.type === 'coral') {
            return (
                <div className={classNames}>
                  <img src={coral} />
                </div>
            );
        }
        else if (cell.type === 'clownfish') {
            return (
                <div className={classNames} onClick={() => this.props.store.dispatch(clickCell(this.props))}>
                  <img src={clownfish} />
                </div>
            );
        }
        else if (cell.type === 'constraint') {

            const fulfilledClass = cell.fulfilled ? 'fulfilled' : cell.unfulfilled ? 'unfulfilled' : '';
            const constraintClass = `${cell.constraintType} ${classNames}`;

            return (
                <div className={constraintClass}>
                  <div className={fulfilledClass}>
                    {cell.value}
                  </div>
                </div>
            );
        }
        else if (cell.type === 'none') {
            return (
                <div className={classNames} />
            );
        }
        else {
            return (
                    <div className={classNames} onClick={() => this.props.store.dispatch(clickCell(this.props))}></div>
            );
        }
    }
}

export default Cell;
