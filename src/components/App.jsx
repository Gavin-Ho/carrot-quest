import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

import StartGame from "./StartGame";
import GameOver from "./GameOver";

var chew = new Audio('../audio/chew-cropped.mp3')
chew.volume = 0.5;

var gameoverSound = new Audio('../audio/mixkit-arcade-retro-game-over-213.wav');
gameoverSound.volume = 0.5;


const RATIO = 2;

const GAMEBOX_HEIGHT = 320 * RATIO;
const GAMEBOX_WIDTH = 180 * RATIO;

const BALLOON_HEIGHT = 65 * RATIO;
const BALLOON_WIDTH = 45 * RATIO;
const BALLOON_X = (GAMEBOX_WIDTH / 2) - (BALLOON_WIDTH / 2);

const OBS_HEIGHT = 22 * RATIO;
const OBS_WIDTH = 33 * RATIO;

const CLOUD_HEIGHT = 12 * RATIO;
const CLOUD_WIDTH = 41 * RATIO;

function App() {
  const [balloonPos, setBalloonPos] = useState(BALLOON_X);
  const [obstacles, setObstacles] = useState([]);
  const [clouds, setClouds] = useState([]);

  const [pressedKey, setPressedKey] = useState(null);

  const [score, setScore] = useState(0);

  const [highscore, setHighscore] = useState(0);

  const [balloonAnimation, setBalloonAnimation] = useState("url('../images/balloon.png')")


  const [gameOn, setGameOn] = useState(false);

  const [promptStatus, setPromptStatus] = useState("Welcome");

  const backgroundMusicRef = useRef(new Audio('../audio/661248__magmadiverrr__video-game-menu-music.mp3'));

  useEffect(() => {
    const backgroundMusic = backgroundMusicRef.current;
    if (gameOn) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play();
      backgroundMusic.volume = 0.3;
      backgroundMusic.addEventListener('ended', () => {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
      });
    } else {
      backgroundMusic.pause();
    }
    return () => {
      backgroundMusic.removeEventListener('ended', () => { });
    };
  }, [gameOn]);

  function startGame() {
    setBalloonPos(BALLOON_X);
    setObstacles([]);
    setClouds([]);
    setPressedKey(null);
    setScore(0);
    setBalloonAnimation("url('../images/balloon.png')");
    setGameOn(true);
    setPromptStatus("");
  }

  function endGame() {
    gameoverSound.play();
    setBalloonPos(BALLOON_X);
    setObstacles([]);
    setClouds([]);
    setPressedKey(null);
    setBalloonAnimation("url('../images/balloon.png')");
    setGameOn(false);
    setPromptStatus("GG");
    if (highscore < score) {
      setHighscore(score);
    }
  }


  //  Balloon movement
  function handleKeyDown(event) {
    if (event.key === "ArrowRight" && balloonPos < GAMEBOX_WIDTH - BALLOON_WIDTH) {
      setPressedKey("ArrowRight");
    } else if (event.key === "ArrowLeft" && balloonPos > 0) {
      setPressedKey("ArrowLeft");
    }
  }

  function handleKeyUp(event) {
    if (event.key === pressedKey) {
      setPressedKey(null);
      setBalloonAnimation("url('../images/balloon.png')");
    }
  }

  useEffect(() => {
    let timer;
    if (pressedKey === "ArrowRight" && balloonPos < GAMEBOX_WIDTH - BALLOON_WIDTH) {
      timer = setInterval(() => {
        setBalloonPos((balloonPos) => balloonPos + 3);
      }, 10);
      setBalloonAnimation("url('../images/balloon_right.png')");
    } else if (pressedKey === "ArrowLeft" && balloonPos > 0) {
      timer = setInterval(() => {
        setBalloonPos((balloonPos) => balloonPos - 3);
      }, 10);
      setBalloonAnimation("url('../images/balloon_left.png')");
    }
    return () => {
      clearInterval(timer);
    };
  }, [balloonPos, pressedKey]);


  useEffect(() => {
    let delay = 1000; // starting delay
    let obsTimeout;
    const addObstacle = () => {
      // Add new obstacles at a random position and time
      setObstacles((prevObstacles) => {
        return [...prevObstacles, { x: Math.floor(Math.random() * (GAMEBOX_WIDTH - OBS_WIDTH)), y: -OBS_HEIGHT }];
      });

      delay = Math.max(500, delay - 10); // decrease delay by 10ms, but keep it above 500ms
      if (gameOn) {
        obsTimeout = setTimeout(addObstacle, delay);
      }
    };

    if (gameOn) {
      obsTimeout = setTimeout(addObstacle, delay);
    }
    return () => clearTimeout(obsTimeout);
  }, [gameOn]);

  useEffect(() => {
    let speed = 4;
    let speedTimeout;
    const moveObstacle = () => {
      // Move obstacles downward
      setObstacles((obstacles) => {
        if (speed < 15) {
          speed += 0.005;
        } else if (speed >= 15)
          speed = 15;
        return obstacles.map((obstacle) => (
          { ...obstacle, y: obstacle.y + speed }
        ));
      });
      if (gameOn) {
        speedTimeout = setTimeout(moveObstacle, 24);
      }
    }
    if (gameOn) {
      speedTimeout = setTimeout(moveObstacle, 24);
    }
    return () => clearTimeout(speedTimeout);
  }, [gameOn]);

  useEffect(() => {
    let cloudTimeout;
    const addCloud = () => {
      setClouds((prevClouds) => {
        // Add new clouds at a random position and time
        return [...prevClouds, { x: Math.floor(Math.random() * (GAMEBOX_WIDTH) - CLOUD_WIDTH / 2), y: -CLOUD_HEIGHT }];
      });
      if (gameOn) {
        cloudTimeout = setTimeout(addCloud, 2000);
      }
    };
    if (gameOn) {
      cloudTimeout = setTimeout(addCloud, 2000);
    }

    return () => {
      clearTimeout(cloudTimeout);
    };
  }, [gameOn]);


  useEffect(() => {
    let moveCloudTimeout;
    const moveClouds = () => {
      setClouds((clouds) => {
        // Move clouds downwards
        return clouds.map((cloud) => ({ ...cloud, y: cloud.y + 3 }));
      });
      if (gameOn) {
        moveCloudTimeout = setTimeout(moveClouds, 48);
      }
    }
    if (gameOn) {
      moveCloudTimeout = setTimeout(moveClouds, 48);
    }
    return () => clearTimeout(moveCloudTimeout);
  }, [gameOn]);


  // Detect obstacle collision
  useEffect(() => {
    const isColliding = obstacles.some((obstacle) => (
      balloonPos + BALLOON_WIDTH >= obstacle.x &&
      balloonPos <= obstacle.x + OBS_WIDTH &&
      obstacle.y + OBS_HEIGHT >= 485 &&
      obstacle.y <= 485 + BALLOON_HEIGHT
    ));

    if (isColliding) {
      chew.play();
      setScore((prevScore) => prevScore + 1);
      setObstacles((prevObstacles) => {
        return prevObstacles.filter((obstacle) => {
          return (
            balloonPos + BALLOON_WIDTH < obstacle.x ||
            balloonPos > obstacle.x + OBS_WIDTH ||
            obstacle.y + OBS_HEIGHT < 485 ||
            obstacle.y > 485 + BALLOON_HEIGHT
          );
        });
      });
    }
  }, [balloonPos, obstacles]);

  useEffect(() => {
    obstacles.forEach((obstacle) => {
      if (obstacle.y >= GAMEBOX_HEIGHT) {
        endGame();
      }
    })
  });

  return (
    <Div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex="0">
      <Title>🐷 PIGS ON THE WING</Title>
      <StartGame start={startGame} status={promptStatus} />
      <GameOver restart={startGame} status={promptStatus} highscore={highscore} score={score} />
      <GameBox height={GAMEBOX_HEIGHT} width={GAMEBOX_WIDTH}>
        <div className="text-2xl text-right m-3 font-bold text-gray-100 uppercase z-5">🥕: {score}</div>
        {obstacles.map((obstacle, index) => (
          <ObstacleBox key={index} top={obstacle.y} left={obstacle.x} height={OBS_HEIGHT} width={OBS_WIDTH} />
        ))}
        {clouds.map((cloud, index) => (
          <Cloud key={index} top={cloud.y} left={cloud.x} height={CLOUD_HEIGHT} width={CLOUD_WIDTH} />
        ))}
        <AirBalloon left={balloonPos} height={BALLOON_HEIGHT} width={BALLOON_WIDTH} animation={balloonAnimation} />
      </GameBox>
    </Div>
  );
}

export default App;

const Div = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #35536B;
  background-image: url("https://www.transparenttextures.com/patterns/always-grey.png");
  /* This is mostly intended for prototyping; please download the pattern and re-host for production environments. Thank you! */
`
const Title = styled.div`
  margin-top: 15px; 
  font-size: 32px;
  font-weight: bold;
  color: #f5f5f5;
`

const GameBox = styled.div`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  top: 10px;
  background-color: #71A9F2;
  background-size: cover;
  border-style: solid;
  border-width: 3px;
  border-color: #2E383F;
  overflow: hidden;
`

const AirBalloon = styled.div`
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: ${(props) => props.animation}; 
  background-size: cover;
  background-position: center;
  top: 475px;
  left: ${(props) => props.left}px;
  z-index: 2;
`

const ObstacleBox = styled.div`
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: url("../images/carrot.png");
  background-size: cover;
  background-position: center;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  z-index: 1;
`

const Cloud = styled.div`
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: url("../images/cloud.png");
  background-size: cover;
  background-position: center;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  z-index: 0;
`