import React from 'react'

function StartGame(props) {
    return (
        <div className={props.status === "Welcome" ? "fixed max-w-md px-7 py-5 mt-56 bg-gray-100 border-2 rounded-md z-50 ease-in-out hover:scale-110 duration-500" : "hidden"}>
            <div className="flex flex-col justify-center items-center">
                <div className="font-bold text-3xl my-3 uppercase text-gray-700">
                    Welcome!
                </div>
                <div className="my-2 text-center">
                    Get ready to take flight as a pig that can apparently operate a hot air balloon 🎈 See how many <span className="font-bold text-orange-600">carrots 🥕</span> you can collect without wasting any!
                </div>
                <div className="my-2 text-center">
                    Use the <span className="font-bold">left</span> and <span className="font-bold">right</span> arrows to move
                </div>
                <button onClick={props.start} type="button" className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 mt-4 rounded uppercase">
                    Play
                </button>
            </div>
        </div>
    )
}

export default StartGame