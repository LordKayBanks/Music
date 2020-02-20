import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { song } from "../../types";
import { connect } from "react-redux";
import { reduxState, create } from "../../reduxHandler";
import { Dispatch } from "redux";
import { DoubleArrow, Loop, PlayPause, Shuffle, randOrder } from "./helpers";
import formatLength from "../formatLength";

let ipcRenderer;
if (window.require) {
  ipcRenderer = window.require("electron").ipcRenderer;
}

let empty: HTMLAudioElement;

function Player({ songs, queue, cur, nextSong, prevSong, setQueue, setCur }) {
  const song: song = queue[cur];

  const ref = useRef(empty);
  // const [ref, setRef] = useState(empty);
  const [timeStamp, setTimeStamp] = useState(0);
  // const onRefChange = useCallback(node => setRef(node), []);
  const [paused, setPaused] = useState(false);
  const [loop, setLoop] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [songData, setSongData] = useState();
  const [shuffle, setShuffle] = useState(false);
  const [exit, setExit] = useState(false);

  const pausePlay = (override = false) => {
    if (!(loaded || override)) return;
    if (ref.current.paused) {
      ref.current.play();
      document.getElementById("box1-play").beginElement();
      document.getElementById("box2-play").beginElement();
    } else {
      ref.current.pause();
      document.getElementById("box1-pause").beginElement();
      document.getElementById("box2-pause").beginElement();
    }

    setPaused(ref.current.paused);
  };

  const updateTimeStamp = e => {
    const newTime = Math.round(e.target.currentTime);
    setTimeStamp(newTime);
  };

  const getSong = async (filePath: string) => {
    if (ipcRenderer) {
      try {
        const newSongData = await ipcRenderer.invoke(
          "get:song-audio",
          filePath
        );
        setSongData(newSongData);
        setLoaded(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const shuffleSongs = () => {
    console.log({ shuffle });
    if (shuffle) {
      const index = songs.findIndex(_song => _song === song);
      setQueue(songs);
      setCur(index);
    } else {
      // Since arrays are passed in by reference, a shallow copy is passed down
      setQueue(randOrder([...queue], cur));
      setCur(0);
    }
    setShuffle(!shuffle);
  };

  const handleEnded = () => {
    setCur((cur + 1) % queue.length);
  };

  const close = () => {
    setExit(true);
    setTimeout(() => setQueue([]), 301);
  };

  useEffect(() => {
    getSong(song.filePath);
  }, [song]);

  useEffect(() => {
    if (ipcRenderer) {
      ipcRenderer.on("pause-play", () => {
        if (window.isFocused) return;
        console.log("HELLO FRIENDS");
        pausePlay(true);
      });
      ipcRenderer.on("seek-back", () => (ref.current.currentTime -= 5));
      ipcRenderer.on("seek-ahead", () => (ref.current.currentTime += 5));
      ipcRenderer.on("prev-track", () => prevSong());
      ipcRenderer.on("next-track", () => nextSong());
    }
  }, []);

  const [formattedTime, formattedTotalTime] = formatLength(
    timeStamp,
    song.length
  );

  return (
    <div className={`player-wrapper${exit ? " closed" : ""}`}>
      <button onClick={close} className="close">
        <span>&#215;</span>
      </button>
      <div className="player">
        <div className="details">
          <img className="thumbnail" src={song.thumbnail} />
          <div>
            <p className="title">{song.title}</p>
            <p className="artist">{song.artist}</p>
          </div>
        </div>
        <div className="controls">
          <button className="back" onClick={cur === 0 ? null : prevSong}>
            <DoubleArrow reversed disabled={cur === 0} />
          </button>
          <button className="pause-play" onClick={() => pausePlay()}>
            {loaded ? <PlayPause paused={paused} /> : "Loading"}
          </button>
          <button
            className="next"
            onClick={cur === songs.length - 1 ? null : nextSong}
          >
            <DoubleArrow disabled={cur === song.length - 1} />
          </button>
        </div>
        <div className="end">
          <p className="time">
            {formattedTime} / {formattedTotalTime}
          </p>
          <Loop enabled={loop} onClick={() => setLoop(!loop)} />
          <Shuffle enabled={shuffle} onClick={shuffleSongs} />
        </div>
        <audio
          onLoad={() => setLoaded(true)}
          onEnded={handleEnded}
          loop={loop}
          ref={ref}
          onTimeUpdate={updateTimeStamp}
          onError={console.error}
          src={songData}
          autoPlay
        ></audio>
      </div>
      <span
        style={{ width: `${(timeStamp / song.length) * 100}%` }}
        className="timeline"
      ></span>
    </div>
  );
}

const mapStateToProps = (state: reduxState) => {
  return { ...state };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    nextSong: create.nextSong(dispatch),
    prevSong: create.prevSong(dispatch),
    setQueue: create.setQueue(dispatch),
    setCur: create.setCur(dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);
