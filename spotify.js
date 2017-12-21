'use strict';
/* global $ */

// You will be responsible for filling in the getArtist function below it.Update this function to:

//   Make a call to the search endpoint using the getFromApi function.
// The query parameter should contain the following information:

// {
//   q: name,
//     limit: 1,
//       type: 'artist'
// }
// Use.then to add a callback which will run when getFromApi resolves.

// Inside the callback you should:

// Set the artist global to be equal to item.artists.items[0], where item is the information obtained from the API(which will be passed as the first argument to your callback).
// Return the artist object.
// Return the promise which you created by calling getFromApi.

// Open up index.html and try running a search.You should see that an artist who matches your search term is added below the search bar.



const CLIENT_ID = 'eb6dfffda5534bb5996e872487be4321';

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;

const getArtist = function (name) {
  let searchParams = {
    q: name,
    type: 'artist',
    limit: 1
  };
  
  /**
   * Returns a single Artist 
   */
  return getFromApi( 'search', searchParams)
    //  
    .then(response => {
      artist = response.artists.items[0];
      return getFromApi(`artists/${artist.id}/related-artists`)
    })
   .then( response => {
          artist.related = response.artists;
        const promises = [];
             artist.related.forEach(a => promises.push(getFromApi(`artists/${a.id}/top-tracks`, { country: 'US' })));
            return Promise.all(promises)
        })
    .then(tracks => {
      tracks.forEach((t, i) => {
        artist.related[i].tracks = t.tracks;
      })
      console.log(artist);
      return artist;
    })
   .catch(err => {
      console.error(`Fail Report: ===> ${err}`);
   });
};

// Endpoint to fetch related artists
// https://api.spotify.com/v1/artists/{id}/related-artists

// Inside the callback you should:
// Set artist.related to item.artists, where item is the object returned by the get related artists endpoint.
// Return the artist object.
// Try searching for an artist again.You should now see a list of related artists also being displayed.


// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
