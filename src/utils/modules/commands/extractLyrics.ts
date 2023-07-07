import axios from 'axios';
import { JSDOM } from 'jsdom';

export const extractLyrics = async (search: string) => {
  let { data } = await axios.get(`https://www.google.com/search`, {
    params: {
      q: `site:https://genius.com/ ${search}`,
    },
  });

  const DOMGoogleSearch = new JSDOM(data);

  const url = DOMGoogleSearch.window.document
    .querySelector('html > body > div > div:nth-child(6) > div > div:nth-child(1) > a')
    ?.attributes.getNamedItem('href')?.textContent;

  ({ data } = await axios.get(`https://www.google.com${url}`, {
    maxRedirects: 1,
  }));

  const DOMGenius = new JSDOM(data);

  const lyricsHtml = DOMGenius.window.document.querySelectorAll(
    '#lyrics-root > [data-lyrics-container="true"]'
  );

  let lyrics = '';

  for (const ly of lyricsHtml) {
    ly.innerHTML = ly.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    lyrics += `${ly.textContent}\n`;
  }

  return lyrics;
};
