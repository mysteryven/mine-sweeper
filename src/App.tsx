import { useEffect, useState } from 'react';

interface Stone {
    isBomb: boolean,
    key: string,
    isFlagged: boolean,
    isRevealed: boolean,
    adjacentBombs: number,
    bombText?: string
}

function generatorMinesStones(rows: number, cols: number): Stone[][] {
    let i = 0
    const stones = Array.from({ length: rows }, (_, row) => {
        return Array.from({ length: cols }, (_, column) => {
            const isBomb = Math.random() < 0.2
            return {
                isBomb,
                key: `${row}-${column}`,
                isFlagged: false,
                isRevealed: false,
                adjacentBombs: 0,
                bombText: '',
            }
        })
    })

    computeAdjacentBombs(stones);

    return stones;
}

function computeAdjacentBombs(stones: Stone[][]) {
    const directions = [
        [-1, -1], [-1, 0],
        [-1, 1], [0, -1],
        [0, 1], [1, -1],
        [1, 0], [1, 1],
    ]

    for (let row = 0; row < stones.length; row++) {
        for (let col = 0; col < stones[row].length; col++) {
            const stone = stones[row][col];
            if (stone.isBomb) {
                continue;
            }
            for (let direction of directions) {
                const adjacentRow = row + direction[0];
                const adjacentCol = col + direction[1];
                if (adjacentRow < 0 || adjacentRow >= stones.length || adjacentCol < 0 || adjacentCol >= stones[row].length) {
                    continue;
                }
                const adjacentStone = stones[adjacentRow][adjacentCol];
                if (adjacentStone.isBomb) {
                    stone.adjacentBombs++;
                }
            }
        }
    }
}
function App() {
    const [finished, setFinished] = useState(false);
    const [stones, setStones] = useState<Stone[][]>(() => {
        return generatorMinesStones(6, 6);
    });

    function flipAllStones() {
        setStones(stones.map(row => row.map(stone => ({ ...stone, isRevealed: true }))));
    }

    useEffect(() => {
        if (finished) {
            return
        }
        let bombsNum = 0
        let notReavealNum = 0
        let revealedBomb = false
        let allBombFlaged = true
        for (let i = 0; i < stones.length; i++) {
            for (let j = 0; j < stones[i].length; j++) {
                if (stones[i][j].isBomb && stones[i][j].isRevealed) {
                    revealedBomb = true
                }

                if (stones[i][j].isBomb) {
                    bombsNum++
                }

                if (!stones[i][j].isFlagged && stones[i][j].isBomb) {
                    allBombFlaged = false
                }

                if (!stones[i][j].isRevealed) {
                    notReavealNum++
                }
            }
        }

        if (revealedBomb) {
            alert('你输啦')
            flipAllStones()
            setFinished(true)
            return
        } else if (bombsNum === notReavealNum || allBombFlaged) {
            alert('你赢啦')
            flipAllStones()
            setFinished(true)
            return
        }

    }, [stones])

    function handleRevealStone(rowIndex: number, columnIndex: number) {
        const newStones = [...stones];
        const stone = newStones[rowIndex][columnIndex];
        if (stone.isRevealed || stone.isFlagged) {
            return;
        }
        stone.isRevealed = true;


        if (stone.adjacentBombs === 0) {
            for (let direction of [
                [-1, -1], [-1, 0],
                [-1, 1], [0, -1],
                [0, 1], [1, -1],
                [1, 0], [1, 1],
            ]) {
                const adjacentRow = rowIndex + direction[0];
                const adjacentCol = columnIndex + direction[1];
                if (adjacentRow < 0 || adjacentRow >= newStones.length || adjacentCol < 0 || adjacentCol >= newStones[rowIndex].length) {
                    continue;
                }
                handleRevealStone(adjacentRow, adjacentCol);
            }
        }
        setStones(newStones);
    }

    function handleRightClickStone(rowIndex: number, columnIndex: number) {
        const newStones = [...stones];
        const stone = newStones[rowIndex][columnIndex];
        if (stone.isRevealed) {
            return;
        }

        stone.isFlagged = !stone.isFlagged;

        setStones(newStones);
    }

    return (
        <div className="flex flex-col items-center mt-20">
            <div className='color-gray mb-4'>PS: 右键可以标记</div>
            {
                stones.map((row, rowIndex) => {
                    return (
                        <div className="flex" key={rowIndex}>
                            {
                                row.map((stone, columnIndex) => {
                                    return (
                                        <SingleStone
                                            key={stone.key}
                                            stone={stone}
                                            onHandleClick={() => handleRevealStone(rowIndex, columnIndex)}
                                            onHandleRightClick={() => handleRightClickStone(rowIndex, columnIndex)}
                                        />
                                    )
                                })
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}

function SingleStone({ stone, onHandleClick, onHandleRightClick }: { stone: Stone, onHandleClick: () => void, onHandleRightClick: () => void }) {

    const computeClassName = () => {

        return `absolute ${stone.isRevealed ? '' : 'bg-gray-500/10 hover:bg-gray-500/20'} text-2xl border-0.5 border-gray-1 font-700 box-border w-16 h-16 flex font-600 items-center justify-center cursor-pointer  `
    }

    function handleClick() {
        onHandleClick();
    }

    function handleRightClick(e: React.MouseEvent) {
        e.preventDefault()
        onHandleRightClick()
    }

    return (
        <div
            className='relative w-16 h-16 m-1px'
            onClick={handleClick}
            onContextMenu={(e) => handleRightClick(e)}
        >
            <div
                className={computeClassName()}
            >
                {
                    stone.isRevealed ? (
                        <span
                            className={`
                            ${stone.adjacentBombs === 0 ? 'color-gray' : ''}
                            ${stone.adjacentBombs === 1 ? 'color-blue' : ''}
                            ${stone.adjacentBombs === 2 ? 'color-red' : ''}
                            ${stone.adjacentBombs === 3 ? 'color-yellow' : ''}
                        `}
                        >{stone.isBomb ? stone.bombText || '💣' : stone.adjacentBombs}</span>
                    ) : (
                        stone.isFlagged ? "🚩" : <div />
                    )
                }

            </div>
        </div>
    )
}

export default App
