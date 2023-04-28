import React from 'react'

function GameOver(props) {
    return (
        <div className={props.status === "GG" ? "fixed max-w-md px-16 py-5 mt-64 bg-gray-100 border-2 rounded-md z-50 ease-in-out hover:scale-110 duration-500" : "hidden"}>
            <div className="flex flex-col justify-center items-center">
                <div className="font-bold text-3xl my-3 uppercase text-gray-700">
                    Game Over!
                </div>
                <div className="mt-4 text-center">
                    <span className="font-bold">GG!</span> You managed to collect <span className="font-bold text-orange-600">{props.score}</span> carrots.
                </div>
                <div className="mt-4 text-center">
                    Your current highscore is <span className="font-bold text-orange-600">{props.highscore}</span> carrots. Would you like to play again?
                </div>
                <button onClick={props.restart} type="button" className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 mt-4 rounded uppercase">
                    Play Again
                </button>
            </div>
        </div>
    )
}

export default GameOver