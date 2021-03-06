import * as React from "react";
import { useEffect } from "react";

import { song } from "#root/types";
import Song from "#shared/Song";
import Loader from "#shared/Loader";
import Error from "#shared/Error";

import downloadImg from "./download.png";

const { ipcRenderer } = window.require("electron");

interface SearchPageParams {
  results: song[];
  loading: boolean;
  success: boolean;
  download: (song: song) => Promise<void>;
}

function SearchPage({ results, download, success, loading }: SearchPageParams) {
  const handleDownload = e => {
    const song = results[+e.target.dataset.index];
    download(song);
  };

  useEffect(() => {
    return () => {
      ipcRenderer.send("reset-global-search");
    };
  }, []);

  if (loading) return Loader;

  if (!success) return Error;

  return (
    <div className="music">
      {results.length ? (
        <ul className="music-names">
          {results.map((song, i) => (
            <li className="result" key={`song-${i}`}>
              <Song
                song={song}
                onClick={handleDownload}
                After={() => (
                  <img
                    className="download"
                    src={downloadImg}
                    alt="download button"
                    data-index={i}
                  />
                )}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-results">No Results</p>
      )}
    </div>
  );
}

export default SearchPage;
