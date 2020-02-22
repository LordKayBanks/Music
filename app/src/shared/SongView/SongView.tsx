import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";

import ContextMenu from "./ContextMenu";
import { song } from "../../types";
import Song from "../../shared/Song";
import { Dispatch } from "redux";
import { create } from "../../reduxHandler";

import logo from "#logos/logo.png";

let ipcRenderer;
if (window.require) {
  ipcRenderer = window.require("electron").ipcRenderer;
}

interface SongViewProps {
  songs: song[];
  allSongs: song[];
  setSongs: React.Dispatch<React.SetStateAction<song[]>>;
  setAllSongs: React.Dispatch<React.SetStateAction<song[]>>;
  setQueue: (songs: song[]) => void;
  reduxSetSongs: (songs: song[]) => void;
  setCur: (num: number) => void;
}

function SongView({
  reduxSetSongs,
  setQueue,
  setSongs,
  setAllSongs,
  setCur,
  allSongs,
  songs
}: SongViewProps) {
  const [pos, setPos] = useState([-200, -200]);
  const [index, setIndex] = useState(-1);

  const _play = (index: number) => {
    reduxSetSongs(allSongs);
    setQueue(allSongs);
    setCur(index);
  };

  const play = () => {
    if (index === -1) return;
    _play(index);
    setPos([-200, -200]);
  };

  const playSong = (song: song) => {
    const index = allSongs.findIndex(_song => _song.title === song.title);
    _play(index);
  };

  const handleDotClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    // Prevent event bubbling
    e.stopPropagation();
    setPos([e.pageX, e.pageY]);
    setIndex(+e.currentTarget.dataset.index);
  };

  const toggleLiked = async () => {
    if (ipcRenderer) {
      await ipcRenderer.send("set:liked", songs[index].title);
    }
  };

  const del = async () => {
    const song = songs[index];
    setSongs([
      ...songs.slice(0, index),
      ...songs.slice(index + 1, songs.length)
    ]);
    const allSongsIndex = allSongs.findIndex(
      value => value.title === song.title
    );
    setAllSongs([
      ...allSongs.slice(0, allSongsIndex),
      ...allSongs.slice(allSongsIndex + 1, allSongs.length)
    ]);
    setPos([-200, -200]);
    if (ipcRenderer) {
      const success = await ipcRenderer.invoke("delete:song", song);
      let body = success
        ? `Succesfully deleted ${song.title} by ${song.artist}`
        : `Couldn't delete ${song.title} by ${song.artist}`;

      new Notification(`${song.title}`, {
        body,
        badge: logo,
        icon: song.thumbnail
      });
    }
  };

  console.log({ songs, index });

  return (
    <>
      <ContextMenu
        pos={pos}
        reset={() => setPos([-200, -200])}
        play={play}
        del={del}
        toggleLiked={toggleLiked}
        liked={index !== -1 && songs[index].liked}
      />
      <ul className="music-names">
        {songs.length ? (
          songs.map((song, i) => (
            <Song
              key={`song-${i}`}
              song={song}
              onClick={() => playSong(song)}
              className="has-dot3"
              After={TripleDot}
              afterProps={{
                onClick: handleDotClick,
                "data-index": i
              }}
            />
          ))
        ) : (
          <p className="no-results">No Songs</p>
        )}
      </ul>
    </>
  );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setQueue: create.setQueue(dispatch),
  reduxSetSongs: create.setSongs(dispatch),
  setCur: create.setCur(dispatch)
});

export default connect(null, mapDispatchToProps)(SongView);

interface TripleDotProps {
  onClick?: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}

const TripleDot = ({ onClick, ...props }: TripleDotProps) => (
  <svg {...props} viewBox="-30 -80 150 180" className="dot3" onClick={onClick}>
    <circle cx="10" cy="10" r="10" fill="white" />
    <circle cx="45" cy="10" r="10" fill="white" />
    <circle cx="80" cy="10" r="10" fill="white" />
  </svg>
);
