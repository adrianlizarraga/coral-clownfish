import Suggester from './suggester';
import CellSuggestion from './cell-suggestion';

export default class DumbSuggester extends Suggester {

    /**
       Helper method that returns true if the specified clown fish (row, col) is in a valid location. That is,
       the fish should be next to a coral tile and away from other fish. Does not take row or column constraints into account.
       @method _isValidFishPlacement
       @param {Integer} row The row index in which fish is located.
       @param {Integer} col The column index in which fish is located.
       @return {Boolean}
    */
    _isValidFishPlacement(row, col, board) {
        return this._isAdjacentToType(row, col, board, 'coral') && !this._isAdjacentToType(row, col, board, 'clownfish', true);
    }

    /**
       Helper method that is used to check whether a specified cell is adjacent to another cell of a certain type.
       @method _isAdjacentToType
       @param {Integer} row The row index of the cell to check.
       @param {Integer} col The column index of the cell to check.
       @param {Array} board The game board.
       @param {String} type The type to look for.
       @param {Boolean} considerDiagonal True if should consider diagonal cells adjacent. Defaults to false.
       @return {Boolean}
    */
    _isAdjacentToType(row, col, board, type, considerDiagonal = false) {
        const startRow = row > 1 ? row - 1 : row;
        const endRow = row < board.length - 1 ? row + 1 : row;
        const startCol = col > 1 ? col - 1 : col;
        const endCol = col < board.length - 1 ? col + 1 : col;

        for (let i = startRow; i <= endRow; ++i) {
            for (let j = startCol; j <= endCol; ++j) {
                const isOriginalCell = i == row && j == col;
                const skipDiagonals = i !== row && col !== j && !considerDiagonal;

                // Don't examine the original cell, or diagonals unless specified.
                if (isOriginalCell || skipDiagonals) {
                    continue;
                }

                const cell = board[i][j];

                if (cell.type == type) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
       Helper method that resets a board. Clears all cells.
       @method _resetBoard
       @param {Array} board The game board to clear.
       @return {void}
    */
    _resetBoard(board) {
        board.forEach(row => {
            row.forEach(cell => {
                if (cell.type !== 'coral' && cell.type !== 'constraint') {
                    cell.type = 'empty';
                }
            });
        });
    }

    /**
       Initializes a game board with the specified state. The state of a board is encoded as an array of fish locations, each
       relative to a unique coral cell. Each state element can take an integer value from 1 to 4.
       - 1 -> fish on top of coral
       - 2 -> fish to the right of the coral
       - 3 -> fish below the coral
       - 4 -> fish to the left of the coral

       For example, if the board has 3 coral cells, the state array [3, 1, 2] would place a fish below the "first" coral, a fish
       above the second coral, and a fish to the right of the third coral.

       @method _setBoardState
       @param {Array} board The game board to initialize.
       @param {Array} state The state array.
       @return {Array} a partial state array if state is invalid, or null on success.
    */
    _setBoardState(board, state) {
        const stateCopy = state.slice();
        const size = board.length - 1;
        const failedState = [];
        const rowFishCount = board.map(() => 0);
        const colFishCount = board.map(() => 0);

        for (let i = 1; i <= size; ++i) {
            for (let j = 1; j <= size; ++j) {

                // No state left to apply
                if (!stateCopy.length) {
                    continue;
                }

                const cell = board[i][j];
                const topCell = (i > 1) ? board[i-1][j] : null;
                const rightCell = (j < size) ? board[i][j+1] : null;
                const bottomCell = (i < size) ? board[i+1][j] : null;
                const leftCell = (j > 1) ? board[i][j-1] : null;
                const prevRowConstraint = (i > 1) ? board[i-1][0].value : null;
                const rowConstraint = board[i][0].value;
                const nextRowConstraint = (i < size) ? board[i+1][0].value : null;
                const prevColConstraint = (j > 1) ? board[0][j-1].value : null;
                const colConstraint = board[0][j].value;
                const nextColConstraint = (j < size) ? board[0][j+1].value : null;

                // Place a fish somewhere next to the coral.
                if (cell.type == 'coral') {
                    const fishState = stateCopy.shift();

                    failedState.push(fishState);

                    // Insert fish on top of coral
                    if (fishState == 1) {
                        if (topCell && (topCell.type == 'empty' || topCell.type == 'water')) {
                            topCell.type = 'clownfish';

                            rowFishCount[i-1] += 1;
                            colFishCount[j] += 1;

                            const violation = rowFishCount[i-1] > prevRowConstraint || colFishCount[j] > colConstraint;

                            if (this._isAdjacentToType(i-1, j, board, 'clownfish', true) || violation) {
                                topCell.type = 'empty';
                                return failedState;
                            }
                        }
                        else {
                            return failedState;
                        }
                    }

                    // Insert fish to the right of coral
                    else if (fishState == 2) {
                        if (rightCell && (rightCell.type == 'empty' || rightCell.type == 'water')) {
                            rightCell.type = 'clownfish';

                            rowFishCount[i] += 1;
                            colFishCount[j+1] += 1;

                            const violation = rowFishCount[i] > rowConstraint || colFishCount[j+1] > nextColConstraint;

                            if (this._isAdjacentToType(i, j+1, board, 'clownfish', true) || violation) {
                                rightCell.type = 'empty';
                                return failedState;
                            }
                        }
                        else {
                            return failedState;
                        }
                    }

                    // Insert fish below coral
                    else if (fishState == 3) {
                        if (bottomCell && (bottomCell.type == 'empty' || bottomCell.type == 'water')) {
                            bottomCell.type = 'clownfish';

                            rowFishCount[i+1] += 1;
                            colFishCount[j] += 1;

                            const violation = rowFishCount[i+1] > nextRowConstraint || colFishCount[j] > colConstraint;

                            if (this._isAdjacentToType(i+1, j, board, 'clownfish', true) || violation) {
                                bottomCell.type = 'empty';
                                return failedState;
                            }
                        }
                        else {
                            return failedState;
                        }
                    }

                    // Insert fish to the left of coral
                    else if (fishState == 4) {
                        if (leftCell && (leftCell.type == 'empty' || leftCell.type == 'water')) {
                            leftCell.type = 'clownfish';

                            rowFishCount[i] += 1;
                            colFishCount[j-1] += 1;

                            const violation = rowFishCount[i] > rowConstraint || colFishCount[j-1] > prevColConstraint;

                            if (this._isAdjacentToType(i, j-1, board, 'clownfish', true) || violation) {
                                leftCell.type = 'empty';
                                return failedState;
                            }
                        }
                        else {
                            return failedState;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
       Helper method that checks if a board is valid. Checks fish placement and row/column constraints.
       @method _isBoardStateValid
       @param {Array} board The game board to check.
       @return {Boolean}
    */
    _isBoardStateValid(board) {
        const size = board.length - 1;
        let rowFishCount = board.map(() => 0);
        let colFishCount = board.map(() => 0);

        for (let i = 1; i <= size; ++i) {
            for (let j = 1; j <= size; ++j) {
                const cell = board[i][j];
                const currentType = cell.type;
                const colConstraint = board[0][j].value;
                const rowConstraint = board[i][0].value;

                if (currentType == 'clownfish') {
                    if (!this._isValidFishPlacement(i, j, board)) {
                        return false;
                    }

                    rowFishCount[i] += 1;
                    colFishCount[j] += 1;
                }

                // Check if we've exceed constraints
                if (rowFishCount[i] > rowConstraint || colFishCount[j] > colConstraint) {
                    return false;
                }

                // Check if the number of fish exactly matches constraints once we reach the end of a row or column.
                if ((j == size && rowFishCount[i] != rowConstraint) || (i == size && colFishCount[j] != colConstraint)) {
                    return false;
                }

            }
        }

        return true;
    }

    /**
       Searches the state space for a valid solution (minus the water cells). Uses a modified depth-first search
       that prunes the solution space to avoid iterating through billions of useless solutions.
       @method _solve
       @param {Array} board The game board to solve.
       @return {Array} Returns the solution state array.
    */
    _solve(board) {
        const numberCorals = board.slice(1).reduce(
            (total, row) => total + row.slice(1).reduce(
                (t, cell) => t + (cell.type == 'coral' ? 1 : 0), 0
            ), 0);

        // Stores the maximum length of each index.
        const lengths = [...Array(numberCorals)].map(() => 4);

        // Stores pseudo for-loop indices.
        let indices = [...Array(numberCorals)].map(() => 0);

        // Ok. This mess below is essentially mimicking nested for-loops. For example, assuming the board only has
        // two corals, the following would be equivalent to:
        //
        // for (let coral1State = 1; coral1State <= 4; ++coral1State) {
        //     for (let coral2State = 1; coral2State <= 4; ++coral2State) {
        //         const state = [ coral1State, coral2State];
        //
        //         // Evaluate state.
        //     }
        // }
        while (true) {
            this._resetBoard(board);

            const state = indices.map(i => i + 1);
            const failedState = this._setBoardState(board, state);

            // Check if state is valid and return it if it's good!
            if (!failedState) {
                if (this._isBoardStateValid(board)) {
                    return state;
                }
            }

            // If we weren't able to fully apply the state due to constraint violations, prune
            // the solution space by skipping ahead! This saves a shit ton of time.
            else if (failedState && failedState.length < indices.length) {

                // Skip by setting later indices to maximum
                indices = indices.map((value, index) => {
                    if (index >= failedState.length) {
                        return lengths[index] - 1;
                    }
                    else {
                        return value;
                    }
                });
            }

            // Recalculate current indices for all state variables.
            ++indices[numberCorals - 1];
            for (let j = numberCorals-1; j >= 0 && indices[j] === lengths[j]; --j) {
                if (j === 0) {
                    return null;
                }

                // Reset the inner loop index and increment the index for the outer loop.
                indices[j] = 0;
                ++indices[j-1];
            }
        }
    }

    /**
       Overridden method of base class. Will return a the next cell to click. Solves the entire game on every call.
       Luckily, it's still pretty fast.
       @method nextSuggestion
       @param {Game} Game object
       @return {Cell}
    */
    nextSuggestion(game) {
        const size = game.board.length - 1;
        const board = game.board.map(row => row.map(cell => Object.assign({}, cell)));
        let row, column  = 0;

        // Solve a copy of the game board.
        console.time('Search duration');
        const state = this._solve(board);
        console.timeEnd('Search duration');

        // Apply the solution state to the board copy.
        this._setBoardState(board, state);

        // Fill in water
        board.forEach(row => {
            row.forEach(cell => {
                if (cell.type == 'empty') {
                    cell.type = 'water';
                }
            });
        })

        // Find the first cell whose type differs from full solution and return it.
        for (let i = 1; i <= size; ++i) {
            for (let j = 1; j <= size; ++j) {
                const cell = game.board[i][j];
                const solvedCell = board[i][j];

                if (cell.type !== solvedCell.type) {
                    row = i;
                    column = j;
                    break;
                }
            }

            if (row && column) {
                break;
            }
        }

        return new CellSuggestion(row, column);
    }
}
