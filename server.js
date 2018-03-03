// This started out as one of the Spotify API code examples
// https://developer.spotify.com/web-api/code-examples/

/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express');
var app = express(); // Express web server framework
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request'); // "Request" library
//   ^^^ watch out not to confuse request object with req callback arg
// naming could be improved for clarity

var querystring = require('querystring');
var cookieParser = require('cookie-parser');

///////////////////////////////////////////////////////////////////////////////
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////////////////////////////////////
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// REMOVE BEFORE PUSHING TO GITHUB
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////////////////////////////////////
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////////////////////////////////////
var client_id = '68d49ecf355c49078720c714d2655b87'; // Your client id
var client_secret = 'da860300f95842e4a0a911d67528829b'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
///////////////////////////////////////////////////////////////////////////////
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////////////////////////////////////
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// REMOVE BEFORE PUSHING TO GITHUB
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////////////////////////////////////
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////////////////////////////////////

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
  console.log('yo root');
  // res.sendFile(__dirname + '/reactindex.html');
  // res.sendFile(__dirname + '/index.html');
  // res.sendFile(__dirname + '/test.html');
});

app.get('/login', nocache, function(req, res) {
  console.log('logging in');
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
      this.current_room = ""
    }
}

// Would prefer to use a map for rooms, but socket.io does not allow
// transmitting map types. Using array of objects instead.
var rooms = [];
class Room {
  constructor(room_name) {
    this.name = room_name
    this.users = [];
  }
}

// will improve instead of iterating through linearly, this is just quick and dirty
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
  let current_room = get_room(clients.get(client).current_room);
  if(current_room != null){
    let index = current_room.users.indexOf(client);
    if (index !== -1) current_room.users.splice(client, 1);
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
    remove_from_current_room(socket.id);
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

  socket.on('try_to_join_room', (client, room_name) => {
    if(room_exists(room_name)){
      remove_from_current_room(client);

      // then add user to new room's user list
      get_room(room_name).users.push(client);
      clients.get(client).current_room = room_name;
      //console.log(clients.get(client));
    }
  });

  socket.on('playlist_add', (uri) => {
    console.log('playlist_add ' + uri);
    io.sockets.emit('playlist_add', uri);
  });

  socket.on("next_track", (track_id) => {
    console.log("next_track " + track_id);
    io.sockets.emit("next_track", track_id);
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
http.listen(8888, function(){
  console.log('listening on port 8888');
});
