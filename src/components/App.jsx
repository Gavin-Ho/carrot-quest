import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

import StartGame from "./StartGame";
import GameOver from "./GameOver";

const chew = new Audio(process.env.PUBLIC_URL + '/audio/chew-cropped.mp3');
chew.volume = 0.5;
chew.preload = 'auto';

var gameoverSound = new Audio('../audio/mixkit-arcade-retro-game-over-213.wav');
gameoverSound.volume = 0.5;

const RATIO = 2;

const GAMEBOX_HEIGHT = 300 * RATIO;
const GAMEBOX_WIDTH = 200 * RATIO;

const BALLOON_HEIGHT = 65 * RATIO;
const BALLOON_WIDTH = 45 * RATIO;
const BALLOON_X = (GAMEBOX_WIDTH / 2) - (BALLOON_WIDTH / 2);

const OBS_HEIGHT = 22 * RATIO;
const OBS_WIDTH = 33 * RATIO;

const CLOUD_HEIGHT = 12 * 1.5 * RATIO;
const CLOUD_WIDTH = 41 * 1.5 * RATIO;

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


  // BACKGROUND MUSIC
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


  // PLAY AUDIO FUNCTION
  const playAudio = (audio) => {
    audio.currentTime = 0;
    audio.play();
  };


  // START GAME
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


  // EMD GAME
  function endGame() {
    playAudio(gameoverSound);
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

  // BALLOON MECHANICS
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight" && balloonPos < GAMEBOX_WIDTH - BALLOON_WIDTH) {
        setPressedKey("ArrowRight");
        setBalloonAnimation("url('../images/balloon_right.png')");
      } else if (event.key === "ArrowLeft" && balloonPos > 0) {
        setPressedKey("ArrowLeft");
        setBalloonAnimation("url('../images/balloon_left.png')");
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === pressedKey) {
        setPressedKey(null);
        setBalloonAnimation("url('../images/balloon.png')");
      }
    };

    const handleKeyPress = (event) => {
      handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyUp);

    let timer;

    if (pressedKey === "ArrowRight" && balloonPos < GAMEBOX_WIDTH - BALLOON_WIDTH) {
      timer = setInterval(() => {
        setBalloonPos((balloonPos) => Math.min(balloonPos + 3, GAMEBOX_WIDTH - BALLOON_WIDTH));
      }, 10);
    } else if (pressedKey === "ArrowLeft" && balloonPos > 0) {
      timer = setInterval(() => {
        setBalloonPos((balloonPos) => Math.max(balloonPos - 3, 0));
      }, 10);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('keyup', handleKeyUp);
      clearInterval(timer);
    };
  }, [pressedKey, balloonPos]);



  // OBSTACLE AND CLOUD MECHANICS
  useEffect(() => {
    let obstacleDelay = 700; // starting delay for adding obstacles
    let obstacleSpeed = 4; // initial speed for moving obstacles
    let cloudTimeout;
    let moveCloudTimeout;
    let obsTimeout;
    let speedTimeout;


    // Add new obstacles at a random position
    const addObstacle = () => {
      setObstacles((prevObstacles) => [
        ...prevObstacles,
        { x: Math.floor(Math.random() * (GAMEBOX_WIDTH - OBS_WIDTH)), y: -OBS_HEIGHT },
      ]);
      obstacleDelay = Math.max(700, obstacleDelay - 10); // decrease delay by 10ms, but keep it above 500ms
      if (gameOn) {
        obsTimeout = setTimeout(addObstacle, obstacleDelay);
      }


    };

    // Move obstacles downwards
    const moveObstacle = () => {
      setObstacles((obstacles) => {
        if (obstacleSpeed < 15) {
          obstacleSpeed += 0.01;
        } else if (obstacleSpeed >= 15) {
          obstacleSpeed = 15;
        }
        return obstacles.map((obstacle) => ({ ...obstacle, y: obstacle.y + obstacleSpeed }));
      });

      if (gameOn) {
        speedTimeout = setTimeout(moveObstacle, 24);
      }
    };

    // Add new clouds at a random position
    const addCloud = () => {
      setClouds((prevClouds) => [
        ...prevClouds,
        { x: Math.floor(Math.random() * (GAMEBOX_WIDTH) - CLOUD_WIDTH / 2), y: -CLOUD_HEIGHT },
      ]);
      if (gameOn) {
        cloudTimeout = setTimeout(addCloud, 3500);
      }
    };

    // Move clouds downwards
    const moveClouds = () => {
      setClouds((clouds) => {
        const newClouds = clouds.map((cloud) => ({ ...cloud, y: cloud.y + 3.5 }));
        return newClouds.filter((cloud) => cloud.y < GAMEBOX_HEIGHT);
      });
      if (gameOn) {
        moveCloudTimeout = setTimeout(moveClouds, 60);
      }
    };


    if (gameOn) {
      obsTimeout = setTimeout(addObstacle, obstacleDelay);
      speedTimeout = setTimeout(moveObstacle, 24);
      cloudTimeout = setTimeout(addCloud, 3500);
      moveCloudTimeout = setTimeout(moveClouds, 60);
    }

    return () => {
      clearTimeout(obsTimeout);
      clearTimeout(speedTimeout);
      clearTimeout(cloudTimeout);
      clearTimeout(moveCloudTimeout);
    };
  }, [gameOn]);



  // DETECT OBSTACLE COLLISION
  useEffect(() => {
    const isColliding = obstacles.some((obstacle) => (
      balloonPos + BALLOON_WIDTH >= obstacle.x &&
      balloonPos <= obstacle.x + OBS_WIDTH &&
      obstacle.y + OBS_HEIGHT >= 485 &&
      obstacle.y <= 485 + BALLOON_HEIGHT
    ));

    if (isColliding) {
      playAudio(chew);
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


  // END GAME IF USER MISSES OBSTACLE
  useEffect(() => {
    obstacles.forEach((obstacle) => {
      if (obstacle.y >= GAMEBOX_HEIGHT) {
        endGame();
      }
    })
  });

  return (
    <Div tabIndex="0">
      <Title>CARROT QUEST 🐷</Title>
      <StartGame start={startGame} status={promptStatus} />
      <GameOver restart={startGame} status={promptStatus} highscore={highscore} score={score} />
      <GameBox height={GAMEBOX_HEIGHT} width={GAMEBOX_WIDTH}>
        <div className="w-full h-full flex">
          <div className="w-[50%] h-full z-10"></div>
          <div className="w-[50%] h-full z-10"></div>
        </div>
        <CarrotScore>{score} 🥕</CarrotScore>
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
  background-color: #3B5377;
  background-image: url("../images/always-grey.png");
`
const Title = styled.div`
  margin-top: 25px; 
  font-size: 42px;
  font-weight: 1000;
  color: #f5f5f5;
  font-family: 'Braah One', sans-serif;
`

const GameBox = styled.div`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-color: #71A9F2;
  background-size: cover;
  border-style: solid;
  border-width: 3px;
  border-color: #2E383F;
  overflow: hidden;
`
// 
const CarrotScore = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  text-align: right;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  z-index: 300;
`;

const AirBalloon = styled.div`
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: ${(props) => props.animation}; 
  background-size: cover;
  background-position: center;
  top: 450px;
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