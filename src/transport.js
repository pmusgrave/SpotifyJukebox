const request = require('request');

module.exports = {
  function begin_playback(auth_keys) {
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, (error, response, body) => {
        // get active device before changing playback
        let num_devices = body.devices.length;
        let device_id = null;
        for (let i = 0; i < num_devices; i++) {
            if (body.devices[i].is_active === true) {
                device_id = body.devices[i].id;
            }
        }
        let options = {
          url: 'https://api.spotify.com/v1/me/player/play',
          headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
          device_id: device_id,
          body: ''
        };
        request.put(options, function(error, response, body) {
          console.log('Playing...');
        });
    });
  }

  function pause_playback(auth_keys) {
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, (error, response, body) => {
        // get active device before changing playback
        let num_devices = body.devices.length;
        let device_id = null;
        for (let i = 0; i < num_devices; i++) {
            if (body.devices[i].is_active === true) {
                device_id = body.devices[i].id;
            }
        }
        let options = {
          url: 'https://api.spotify.com/v1/me/player/pause',
          headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
          device_id: device_id
        };
        request.put(options, function(error, response, body) {
          console.log('Pausing...');
        });
    });
  }

  play_next_track(auth_keys, track_id) {
    //console.log(JSON.stringify({"uris": [track_id]}));
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
        // get active device before changing playback
        if(body.devices != undefined){
          let num_devices = body.devices.length;
          let device_id = null;
          for (let i = 0; i < num_devices; i++) {
              if (body.devices[i].is_active === true) {
                  device_id = body.devices[i].id;
              }
          }
          let options = {
            url: 'https://api.spotify.com/v1/me/player/play',
            headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
            device_id: device_id,
            json: true,
            body: JSON.stringify({"uris": [track_id]})
          };
          request.put(options, function(error, response, body) {
            //console.log(response);
            console.log('Next track... ' + track_id);
          });
        }
    });
  }

  return{
    begin_playback: begin_playback;
    pause_playback: pause_playback;
    play_next_track: play_next_track;
  }
}
