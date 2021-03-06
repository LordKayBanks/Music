import axios from "axios";
import { song } from "../types";

const urlSearch = "https://www.googleapis.com/youtube/v3/search";
const urlDetails = "https://www.googleapis.com/youtube/v3/videos";

export interface youtubeDetails {
  id: string;
  length: number;
}

/**
 * getYoutubeId()
 *
 * @param {string} query The title of the video to search on youtube's API
 *
 * Returns the first result's youtube id from a search query
 */
const getYoutubeDetails = async (song: song): Promise<youtubeDetails> => {
  // Makes sure to get the right video
  let query = `${song.title} ${song.artist} official music video`;

  query = query.replace(" ", "+");

  const result = await axios.get(urlSearch, {
    params: {
      key: process.env.GOOGLE_API_KEY,
      q: query,
      part: "snippet"
    }
  });

  const id = result.data.items[0].id.videoId;

  const response = await axios.get(urlDetails, {
    params: {
      key: process.env.GOOGLE_API_KEY,
      part: "contentDetails",
      id
    }
  });

  return {
    id,
    length: parseDuration(response.data.items[0].contentDetails.duration)
  };
};

export default getYoutubeDetails;

const parseDuration = (dur: string) => {
  const hourMatch = dur.match(/[0-9]*H/);
  const hours = hourMatch ? +hourMatch[0].slice(0, -1) : 0;

  const minMatch = dur.match(/[0-9]*M/);
  const mins = minMatch ? +minMatch[0].slice(0, -1) : 0;

  const secMatch = dur.match(/[0-9]*S/);
  const secs = secMatch ? +secMatch[0].slice(0, -1) : 0;

  return hours * 3600 + mins * 60 + secs;
};
