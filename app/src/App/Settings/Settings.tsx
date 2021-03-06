import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import NumberSelection from "./NumberSelection";
import Toggle from "./Toggle";
import { reduxState } from "#root/reduxHandler";

const { ipcRenderer } = window.require("electron");

const min = 2;
const thresh = 30;
const dthresh = thresh - min + 1;

function Settings() {
  const [dir, setDir] = useState("");
  const [jumpBack, setJumpBack] = useState(min * 2);
  const [seekBack, setSeekBack] = useState(min);
  const [seekAhead, setSeekAhead] = useState(min);
  const [jumpAhead, setJumpAhead] = useState(min * 2);
  const [controls, setControls] = useState(false);

  const { queue, cur } = useSelector((state: reduxState) => state);

  const changeDirectory = () => {
    ipcRenderer.invoke("set:music-dir").then((res: string) => setDir(res));
  };

  const generateFunctions = (
    func: React.Dispatch<React.SetStateAction<number>>
  ) => ({
    prev: (num: number) => func(((num - 1 + dthresh - min) % dthresh) + min),
    next: (num: number) => func(((num + 1 - min) % dthresh) + min)
  });

  const applyChanges = () => {
    ipcRenderer.send("set:info", {
      jumpBack,
      seekBack,
      seekAhead,
      jumpAhead
    });
  };

  const toggleControlWindow = () => {
    const isPlaying: boolean = queue.length > 0;

    ipcRenderer.send(
      "set:control-window",
      !controls,
      isPlaying,
      isPlaying ? queue[cur] : null
    );
    setControls(!controls);
  };

  useEffect(() => {
    ipcRenderer.invoke("get:info").then(info => {
      setDir(info.dir);
      setJumpBack(info.jumpBack);
      setSeekBack(info.seekBack);
      setSeekAhead(info.seekAhead);
      setJumpAhead(info.jumpAhead);
      setControls(info.controlWindow);
    });
  }, []);

  return (
    <div className="settings">
      <h1 className="header">Settings</h1>
      <div className="setting">
        <p className="name">
          Directory from which songs are taken:
          {dir.length ? <span>{dir}</span> : "  Unset"}
        </p>
        <button className="change" onClick={changeDirectory}>
          Change Directory
        </button>
      </div>
      <hr />
      <div className="setting">
        <p className="name">Jump Backward timer: </p>
        <NumberSelection num={jumpBack} {...generateFunctions(setJumpBack)} />
      </div>
      <div className="setting">
        <p className="name">Seek Backward timer: </p>
        <NumberSelection num={seekBack} {...generateFunctions(setSeekBack)} />
      </div>
      <div className="setting">
        <p className="name">Seek Forward timer: </p>
        <NumberSelection num={seekAhead} {...generateFunctions(setSeekAhead)} />
      </div>
      <div className="setting">
        <p className="name">Jump Forward timer: </p>
        <NumberSelection num={jumpAhead} {...generateFunctions(setJumpAhead)} />
      </div>
      <button className="change center" onClick={applyChanges}>
        Change
      </button>
      <hr />
      <div className="setting">
        <p className="name">
          Open Secondary Control Window when music is playing?
        </p>
        <Toggle toggled={controls} toggle={toggleControlWindow} />
      </div>
    </div>
  );
}

export default Settings;
