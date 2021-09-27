import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const boardSize = 10 ;
const winSize = 5;

function Square({value, onClick, inWinLine})
{
        return (
            <button className={'square ' + (inWinLine ? 'winLine' : '')}
                    onClick={() => onClick()}>
                {value}
            </button>
        );
}

class Board extends React.Component {

    renderSquare(i) {
        const winLine = this.props.winLine;
        return <Square key={i} value={this.props.squares[i]}
                       onClick={() => this.props.onClick(i)}
                       inWinLine = {winLine && winLine.includes(i)}
        />;

    }

    render() {
        let board = [];
        for (let i = 0; i < boardSize; i++)
        {
            let row = [];
            for (let j = 0; j < boardSize; j++)
            {
                row.push(this.renderSquare(i*boardSize+j));
            }
            board.push(<div key={i} className="board-row">{row}</div>);
        }

        return (
            <div>
                {board}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(boardSize*boardSize).fill(null),
                moveIndex: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            sortAscending: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i] )
        {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                moveIndex: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    handleSortClick() {
        this.setState( {
            sortAscending: !this.state.sortAscending,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares).winner;
        const winLine =  calculateWinner(current.squares).winLine;
        const moves = history.map((step, move) => {
            const rowDesc = 1 + step.moveIndex % boardSize;
            const colDesc = 1 + Math.floor(step.moveIndex / boardSize);
            const playerDesc = (move % 2 === 1) ? 'X' : 'O';
            const desc = move ?
                'Move ' + move + ': ' + playerDesc + ' plays (' + rowDesc + ',' + colDesc + ')' :
                'Go to game start';
            return (
                <li key={move}>
                    <button className={move === this.state.stepNumber ? 'selected-move' : ''} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        const isAscending = this.state.sortAscending;
        if (!isAscending) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else if (this.state.stepNumber === boardSize*boardSize) {
            status = 'Draw';
        }
        else
        {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winLine={winLine}
                    />
                </div>
                <div className="game-info">
                    <div>{ status } <button onClick={() => this.handleSortClick()}>
                        {this.state.sortAscending ? 'Sort Descending' : 'Sort Ascending'}
                    </button></div>

                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [];
    for (let i = 0; i < boardSize*boardSize; i++) {
        let winConRow = [];
        let winConColumn = [];
        let winConDiagon1 = [];
        let winConDiagon2 = [];
        if (i+winSize-1 < boardSize*(Math.floor(i/boardSize)+1)) {
            for (let j=0; j < winSize; j++) {
                winConRow.push(i + j);
            }
            lines.push(winConRow);
        }
        if (i+boardSize*(winSize-1) < boardSize*boardSize) {
            for (let j=0; j < winSize; j++) {
                winConColumn.push(i + boardSize * j);
            }
            lines.push(winConColumn);
        }
        if ((boardSize - (i % boardSize))>= winSize && (boardSize - Math.floor(i / boardSize))>= winSize) {
            for (let j=0; j < winSize; j++) {
                winConDiagon1.push(i + boardSize * j + j);
            }
            lines.push(winConDiagon1);
        }
        if ((i % boardSize + 1 ) >= winSize && (boardSize - Math.floor(i / boardSize))>= winSize) {
            for (let j=0; j < winSize; j++) {
                winConDiagon2.push(i + boardSize * j - j);
            }
            lines.push(winConDiagon2);
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let check = squares[lines[i][0]];
        for (let j=1;j<lines[i].length; j++)
        {
            if (check !== squares[lines[i][j]])
            {
                check = null;
                break;
            }
        }
        if (check)
        return {
            winner: check,
            winLine: lines[i],
        };
    }
    return {
        winner: null,
    };
}
