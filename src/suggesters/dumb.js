import Suggester from './suggester';
import CellSuggestion from './cell-suggestion';

export default class DumbSuggester extends Suggester {

    /**
       Suggester constructor.
       @method constructor
       @param {String}
       @return {void}
    */
    constructor(name) {
        super(name);

        this._states = [];
        this._skipped = 0;
        this._processed = 0;
        this._invalid = 0;
    }

    _isBoardValid(board, row, col) {
        const size = board.length - 1;
        let rowFishCount = board.map(() => 0);
        let colFishCount = board.map(() => 0);

        for (let i = 1; i <= row; ++i) {
            for (let j = 1; j <= col; ++j) {
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

                //debugger;
                if (rowFishCount[i] > rowConstraint || colFishCount[j] > colConstraint) {
                    return false;
                }

                if ((j == size && rowFishCount[i] != rowConstraint) || (i == size && colFishCount[j] != colConstraint)) {
                    debugger;
                    return false;
                }

            }
        }

        return true;
    }

    _isValidFishPlacement(row, col, board) {
        return this._isAdjacentToType(row, col, board, 'coral') && !this._isAdjacentToType(row, col, board, 'clownfish', true);
    }

    _isAdjacentToType(row, col, board, type, considerDiagonal = false) {
        const startRow = row > 1 ? row - 1: row;
        const endRow = row < board.length - 1 ? row + 1: row;
        const startCol = col > 1 ? col - 1: col;
        const endCol = col < board.length - 1 ? col + 1: col;

        //console.log(`${startRow} ${endRow} ${startCol} ${endCol}`);
        //console.log(board);

        for (let i = startRow; i <= endRow; ++i) {
            for (let j = startCol; j <= endCol; ++j) {
                if (i == row && j == col) {
                    continue;
                }

                const cell = board[i][j];

                if (i != row && col != j && !considerDiagonal) {
                    continue;
                }

                if (cell.type == type) {
                    return true;
                }
            }
        }
        return false;
    }

    _getPossibleCellTypes(row, col, board) {
        const cell = board[row][col];
        const possibleTypes = [];

        if (cell.type == 'coral') {
            possibleTypes.push('coral');
        }
        else {
            if (this._isAdjacentToType(row, col, board, 'coral')) {
                possibleTypes.push('clownfish');
            }
            possibleTypes.push('water');
        }

        return possibleTypes; // water, clownfish
    }

    _getPreviousNonCoralCell(row, col, board) {
        for (let i = row; i >= 1; i--) {
            for (let j = col; j >= 1; j--) {
                if (i == row && j == col) {
                    continue;
                }

                const cell = board[i][j];

                if (cell.type != 'coral') {
                    return {row: i, col: j};
                }
            }
        }
    }

    _solve(board, startRow, startCol) {
        const size = board.length - 1;
        let prevCellCoordinates = null;
        //const board = game.board.map(row => row.slice());

        for (let i = startRow; i < size+1; ++i) {
            for (let j = startCol; j < size+1; ++j) {
                const cell = board[i][j];
                const currentType = cell.type;
                //const colConstraint = game.board[0][j].value;
                //const rowConstraint = game.board[i][0].value;

                //console.log(`colConstraints ${colConstraint}`);
                //console.log(`rowConstraints ${rowConstraint}`);
                //console.log(`(${i}, ${j}) - ${cell.type}`)
               // debugger;
                if (currentType == 'coral') {
                    continue;
                }

                const possibleTypes = this._getPossibleCellTypes(i, j, board);
                if (possibleTypes.length == 1) {
                    cell.type == possibleTypes[0];
                    continue;
                }

                const typesToTry = possibleTypes.filter(type => cell.types.indexOf(type) < 0);
                console.log(cell.types);
                console.log(typesToTry);
                //debugger;

                // set first possible type
                for (let k = 0; k < typesToTry.length; ++k) {
                    if (currentType == typesToTry[k]) {
                        continue;
                    }
                    console.log(`(${i}, ${j}) - Trying ${typesToTry[k]}`);
                    cell.type = typesToTry[k];
                    cell.types.push(typesToTry[k]);

                    if (this._isBoardValid(board, i, j)) {
                        console.log('VALID');
                        break;
                    }
                    else{
                        console.log('INVALID');
                    }
                }

                // Backtrack
                if (cell.type == 'empty' || !this._isBoardValid(board, i, j)) {
                    cell.type = 'empty';
                    cell.types = [];
                    //debugger;

                    prevCellCoordinates = this._getPreviousNonCoralCell(i, j, board);
                    console.log(`(${i}, ${j}) - backtracking to (${prevCellCoordinates.row}, ${prevCellCoordinates.col})`);
                    const prevCell = board[prevCellCoordinates.row][prevCellCoordinates.col]

                    prevCell.type = 'empty';
                    break;
                    //return this._solve(board, prevCellCoordinates.row, prevCellCoordinates.col);
                }
            }

            if (prevCellCoordinates) {
                break;
            }
        }

        if (prevCellCoordinates) {
            return this._solve(board, prevCellCoordinates.row, prevCellCoordinates.col);
        }

        return board;
    }

    _printBoard(board) {
        for (let i = 1; i < board.length; ++i) {
            const rowString = `${board[i].map(cell => cell.type).join()}`;
            console.log(rowString);
        }
    }

    _resetBoard(board) {
        const size = board.length - 1;

        for (let i = 1; i <= size; ++i) {
            for (let j = 1; j <= size; ++j) {
                const cell = board[i][j];

                if (cell.type != 'coral') {
                    cell.type = 'empty';
                }
            }
        }
    }

    _setBoardState(board, state) {
        const stateCopy = state.slice();
        const size = board.length - 1;
        const usedStates = [];
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

                if (cell.type == 'coral') {
                    const fishState = stateCopy.shift();

                    usedStates.push(fishState);

                    // Top of coral
                    if (fishState == 1) {
                        if (topCell && topCell.type == 'empty') {
                            topCell.type = 'clownfish';

                            rowFishCount[i-1] += 1;
                            colFishCount[j] += 1;

                            const violation = rowFishCount[i-1] > prevRowConstraint || colFishCount[j] > colConstraint;

                            if (this._isAdjacentToType(i-1, j, board, 'clownfish', true) || violation) {
                                topCell.type = 'empty';
                                return usedStates;
                            }
                        }
                        else {
                            return usedStates;
                        }
                    }

                    // Right of coral
                    else if (fishState == 2) {
                        if (rightCell && rightCell.type == 'empty') {
                            rightCell.type = 'clownfish';

                            rowFishCount[i] += 1;
                            colFishCount[j+1] += 1;

                            const violation = rowFishCount[i] > rowConstraint || colFishCount[j+1] > nextColConstraint;

                            if (this._isAdjacentToType(i, j+1, board, 'clownfish', true) || violation) {
                                rightCell.type = 'empty';
                                return usedStates;
                            }
                        }
                        else {
                            return usedStates;
                        }
                    }

                    // Below coral
                    else if (fishState == 3) {
                        if (bottomCell && bottomCell.type == 'empty') {
                            bottomCell.type = 'clownfish';

                            rowFishCount[i+1] += 1;
                            colFishCount[j] += 1;

                            const violation = rowFishCount[i+1] > nextRowConstraint || colFishCount[j] > colConstraint;

                            if (this._isAdjacentToType(i+1, j, board, 'clownfish', true) || violation) {
                                bottomCell.type = 'empty';
                                return usedStates;
                            }
                        }
                        else {
                            return usedStates;
                        }
                    }

                    // Left of coral
                    else if (fishState == 4) {
                        if (leftCell && leftCell.type == 'empty') {
                            leftCell.type = 'clownfish';

                            rowFishCount[i] += 1;
                            colFishCount[j-1] += 1;

                            const violation = rowFishCount[i] > rowConstraint || colFishCount[j-1] > prevColConstraint;

                            if (this._isAdjacentToType(i, j-1, board, 'clownfish', true) || violation) {
                                leftCell.type = 'empty';
                                return usedStates;
                            }
                        }
                        else {
                            return usedStates;
                        }
                    }
                }
            }
        }

        return null;
    }

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

                if (rowFishCount[i] > rowConstraint || colFishCount[j] > colConstraint) {
                    return false;
                }

                if ((j == size && rowFishCount[i] != rowConstraint) || (i == size && colFishCount[j] != colConstraint)) {
                    return false;
                }

            }
        }

        return true;
    }

    _arraysEqual(a, b) {
        for (let i = 0; i < a.length; ++i) {
            if (a[i] != b[i]) return false;
        }

        return true;
    }

    _arrayStartsWith(a, b) {
        for (let i = 0; i < b.length; ++i) {
            if (b[i] != a[i]) return false;
        }

        return true;
    }

    _skipState(state) {
        return this._states.some(s => this._arrayStartsWith(state, s));
    }

    _loopManyTimes(board, loopLimits) {
        this._doLoopManyTimes(board, loopLimits, [], 0);
    }

    _doLoopManyTimes(board, loopLimits, args, index) {
        if (!loopLimits.length) {
            if (this._skipState(args)) {
                //console.log(`Skipped state ${args.join()}`);
                this._skipped += 1;
                return false;
            }
            this._resetBoard(board);

            const usedStates = this._setBoardState(board, args);

            this._processed += 1;
            if (!usedStates) {
                if (this._isBoardStateValid(board)) {
                    console.log(args);
                    return true;
                }
                else {
                    this._invalid += 1;
                }
            }
            else if (usedStates && usedStates.length < args.length) {
                console.log(`Pushed state ${usedStates.join()} at ${args.join()}`);
                this._states.push(usedStates);
                console.log(`skipped: ${this._skipped}, processed: ${this._processed}, invalid: ${this._invalid}`);
            }

            return false;
        }
        else {
            const otherLoopLimits = loopLimits.slice(1);

            for (args[index] = 1; args[index] <= loopLimits[0]; ++args[index]) {
                if (this._doLoopManyTimes(board, otherLoopLimits, args, index + 1)) {
                    return true;
                }
            }

            return false;
        }
    }

    _everyPermutation(args, board) {
        const indices = args.map(a => a.min);

        for (let j = args.length; j >= 0;) {
            //if (fn(indices)) {
            //    break;
            //}

            if (this._skipState(indices)) {
                //console.log(`Skipped state ${indices.join()}`);
                this._skipped += 1;
            }
            else {
                this._resetBoard(board);

                const usedStates = this._setBoardState(board, indices);

                this._processed += 1;
                if (!usedStates) {
                    if (this._isBoardStateValid(board)) {
                        console.log(indices);
                        return;
                    }
                    else {
                        this._invalid += 1;
                    }
                }
                else if (usedStates && usedStates.length < indices.length) {
                    console.log(`Pushed state ${usedStates.join()} at ${indices.join()}`);
                    this._states.push(usedStates);
                    console.log(`skipped: ${this._skipped}, processed: ${this._processed}, invalid: ${this._invalid}`);
                }
            }

            for (j = args.length; j--;) {
                if (indices[j] < args[j].max) {
                    ++indices[j];
                    break;
                }
                indices[j] = args[j].min;
            }
        }
    }

    _allCombinations(lengths, board) {
        const n = lengths.length;
        let indices = [...Array(n)].map(() => 0);

        while (true) {
            const args = indices.map(i => i + 1);
            //console.log(indices);

            this._resetBoard(board);

            const usedStates = this._setBoardState(board, args);

            this._processed += 1;
            if (!usedStates) {
                if (this._isBoardStateValid(board)) {
                    console.log(args);
                    return args;
                }
                else {
                    this._invalid += 1;
                }
            }
            else if (usedStates && usedStates.length < indices.length) {
                // Skip by setting later indices to maximum
                //console.log(`Skipping from ${indices.join()}`);
                indices = indices.map((value, index) => {
                    if (index >= usedStates.length) {
                        return lengths[index] - 1;
                    }
                    else {
                        return value;
                    }
                });

                //console.log(`TO ${indices.join()}`);
            }

            ++indices[n-1];
            for (let j = n-1; j >= 0 && indices[j] === lengths[j]; --j) {
                if (j === 0) { return null; }
                indices[j] = 0;
                ++indices[j-1];
            }
        }
    }

    /**
       Return a random number integer in a range.
       @method _getRandomInt
       @param {Integer} min The minimum in range.
       @param {Integer} max The max in range.
       @return {Integer}
    */
    _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max) + 1;
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
       Overridden method of base class. Will return a random cell to click.
       @method nextSuggestion
       @param {Game} Game object
       @return {Cell}
    */
    nextSuggestion(game) {
        this._states = [];
        this._skipped = 0;
        this._processed = 0;
        this._invalid = 0;

        const size = game.board.length - 1;
        let row, column  = 0;

        const board = game.board.map(row => row.map(cell => Object.assign({}, cell)));
        const numberCorals = board.slice(1).reduce((total, row) => total + row.slice(1).reduce((t, cell) => t + (cell.type == 'coral' ? 1 : 0), 0), 0);
        const loopLimits = [...Array(numberCorals)].map(() => 4);
        const l = [...Array(numberCorals)].map(() => ({min: 1, max: 5}));

        //debugger;

        console.log(numberCorals);
        console.log(loopLimits);
        console.time('DFS');
        //this._loopManyTimes(board, loopLimits);
        //this._everyPermutation(l, board);
        this._allCombinations(loopLimits, board);
        console.timeEnd('DFS');

        // Pick a non coral cell
        do {
            row = this._getRandomInt(1, size);
            column = this._getRandomInt(1, size);
        } while (game.board[row][column].type == 'coral');

        return new CellSuggestion(row, column);
    }
}
