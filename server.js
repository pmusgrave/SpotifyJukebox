// This started out as one of the Spotify API code examples
// https://developer.spotify.com/web-api/code-examples/
require('dotenv').config();
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let request = require('request');

let querystring = require('querystring');
let cookieParser = require('cookie-parser');

let client_id = process.env.SPOTIFY_CLIENT_ID;
let client_secret = process.env.SPOTIFY_CLIENT_SECRET;
let redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


var stateKey = 'spotify_auth_state';

/******************************************************
                    EXPRESS
******************************************************/
function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use(express.static(__dirname + '/build'));
app.use(cookieParser());

app.get('/', nocache, function(req, res) {
  console.log('GET /');
  // res.sendFile(__dirname + '/reactindex.html');
  res.sendFile(__dirname + '/index.html');
  // res.sendFile(__dirname + '/test.html');
});

app.get('/login', nocache, function(req, res) {
  console.log('GET /login');
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played';
  res.redirect('https://accounts.spotify.com/authorize?' +
  querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  }));
});

app.get('/callback', nocache, function(req, res) {
  console.log('GET /callback');

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && res.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me/player/devices',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        request.get(options, function(error, res, body) {});

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
    } else {
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
      }
    });
  }
});

app.get('/refresh_token', nocache, function(req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, res, body) {
    if (!error && res.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

/******************************************************
                   SOCKET.IO
******************************************************/
var clients = new Map();
class Client {
    constructor(socket) {
      this.socket = socket,
      this.handle = "",
      this.current_room = ""
    }
}

// Would prefer to use a map for rooms, but socket.io does not allow
// transmitting map types. Using array of objects instead.
var rooms = [];
class Room {
  constructor(room_name) {
    this.name = room_name;
    this.user_socket_ids = [];
    this.user_handles = [];
    this.playlist = [];
  }
}

function get_room(room_name) {
  for(let i = 0; i < rooms.length; i++) {
    if(rooms[i].name == room_name){
      return rooms[i];
    }
  }
}

function room_exists(room_name) {
  return(get_room(room_name) != undefined);
}

function remove_from_current_room(client) {
  // remove user from users list of their current room, if they are in one
  let current_room = get_room(client.current_room);
  if(current_room != null){
    let index = current_room.user_socket_ids.indexOf(client.socket.id);
    if (index !== -1) {
      current_room.user_socket_ids.splice(index, 1);
    }

    index = current_room.user_handles.indexOf(client.handle);
    if (index !== -1) {
      current_room.user_handles.splice(index, 1);
    }
  }
}

io.on('connection', function(socket){
  // connections should only happen after user authenticates with Spotify
  // OR, I might have to create a socket client object initially,
  // and emit a signal when auth is successful and do
  // everything in the auth_success callback

  console.log('a user connected. id: ' + socket.id);
  clients.set(socket.id, new Client(socket));
  socket.emit('updated_room_list', rooms);

  socket.on("disconnect", function() {
    console.log("user " + socket.id + " disconnected.");
    remove_from_current_room(clients.get(socket.id));
    clients.delete(socket.id);
  })

  socket.on('new_room', (room) => {
    if(!room_exists(room)){
      if (room != null) {
        console.log("room created: " + room);
        rooms.push(new Room(room));
      }
      // console.log(rooms);
      socket.emit('updated_room_list', rooms);
    }
    else {
      console.log("room already exists");
      socket.emit('updated_room_list', rooms);
    }
  });

  socket.on('try_to_join_room', (client, handle, room_name) => {
    if(room_exists(room_name)){
      remove_from_current_room(clients.get(client));

      let room = get_room(room_name);

      // add user to new room's user list
      room.user_socket_ids.push(client);
      room.user_handles.push(handle);

      clients.get(client).current_room = room_name;
      clients.get(client).handle = handle;

      io.sockets.emit('you_are_in', client, handle, room.user_handles, room_name);

      // and update the client's playlist with the existing party playlist
      io.sockets.emit('playlist_add', room, room.playlist);
      console.log(rooms);
    }
  });

  socket.on('remove_me_from_room', (client) => {
    console.log('removing ' + client);
    let room = get_room(clients.get(client).current_room);
    remove_from_current_room(clients.get(client));
    console.log(room);
    socket.emit('updated_user_list', room.user_handles);
  })

  socket.on('delete_room', (client, room_name) => {
    if(room_exists(room_name)){
      console.log('deleting... ' + room_name);
      rooms.splice(rooms.indexOf(get_room(room_name)),1);
      console.log(rooms)
      socket.emit('updated_room_list', rooms);
    }
  });

  socket.on('playlist_add', (client, uri) => {
    let room = get_room(clients.get(client).current_room);
    if(room != null){
      room.playlist.push(uri);
      console.log('playlist_add ' + uri);
      console.log(room)

      // for now, sending entire playlist, but this should change to
      // only sending updates or periodically checking if client is synced
      // with server
      io.sockets.emit('playlist_add', room, room.playlist);
    }
    else {
      console.log("not in a room. get a room.");
    }
  });

  socket.on("next_track", (client, track_id) => {
    let room = get_room(clients.get(client).current_room);
    if(room != null){
      room.playlist = room.playlist.slice(1);
      console.log(room)

      console.log("next_track " + track_id);
      io.sockets.emit("next_track", track_id);
    }
  })
});

function room_auth(join) {
  if(false){
    join();
  }
}

/******************************************************
                  HTTP SERVER
******************************************************/
http.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
