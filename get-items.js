var inquirer = require('inquirer');
var request  = require('request');
var express  = require('express');
var fs       = require('fs');
var open     = require('open');

var headers = {
    'User-Agent': 'PocketViz/0.0.1',
    'Content-Type': 'application/json; charset=UTF8',
    'X-Accept': 'application/json'
};

function getRequestToken(consumerKey, callback) {
    console.log('Getting request token...');

    var options = {
        url: 'https://getpocket.com/v3/oauth/request',
        method: 'POST',
        headers: headers,
        form: {'consumer_key': consumerKey, 'redirect_uri': 'http://localhost:8080/request'}
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                callback(null, JSON.parse(body).code);
            }
            catch(e) {
                callback(e, null);
            }
        }
        else {
            console.log(error);
            console.log(response);
        }
    });
}

function getAuthToken(consumerKey, requestCode, callback) {
    console.log('Getting auth token...');

    var options = {
        url: 'https://getpocket.com/v3/oauth/authorize',
        method: 'POST',
        headers: headers,
        form: {'consumer_key': consumerKey, 'redirect_uri': 'http://localhost:8080/request', 'code': requestCode}
    };

    request(options, function (error, response, body) {
        try {
            console.log(body);
            callback(null, JSON.parse(body).access_token);
        }
        catch(e) {
            callback(e, null);
        }
    });
}

function getItems(consumerKey, accessToken, callback) {
    console.log('Getting items..');

    var offset = 0;
    var count = 1000;
    var allItems = [];

    function next() {
        getList(consumerKey, accessToken, offset, count, function(err, items) {
            if (err) {
                console.log(err);
                return;
            }
            allItems = allItems.concat(items);
            offset += items.length;

            if (items.length == count) {
                setTimeout(next, 1);
            }
            else {
                console.log('Total items', allItems.length);
                callback(null, allItems);
            }
        })
    }

    next();
}

function getList(consumerKey, accessToken, offset, count, callback) {
    console.log('Getting items from', offset, 'to', offset + count);

    var options = {
        url: 'https://getpocket.com/v3/get',
        method: 'POST',
        headers: headers,
        form: {'consumer_key': consumerKey, 'redirect_uri': 'http://localhost:8080/request', 'access_token': accessToken, 'state': 'all', 'offset':offset, 'count':count, "detailType":"complete"}
    };

    request(options, function (error, response, body) {
        //console.log(error, response, body)
        if (!error && response.statusCode == 200) {
            try {
                var list = JSON.parse(body).list;
                var ids = Object.getOwnPropertyNames(list);
                var items = [];
                for(var i=0; i<ids.length; i++) {
                    items.push(list[ids[i]]);
                }
                callback(null, items);
            }
            catch(e) {
                callback(e, null)
            }
        }
        else {
            console.log(error);
            callback(error, null)
        }
    });
}

var app      = express();

app.get('/request', function(req, res) {
});

app.get('/auth', function(req, res) {
    res.send('Thanks! You can go back to the terminal now. Closing this window in 3s...<script>setTimeout(function() { window.close();}, 3000)</script>');
});

var server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
    login();
});

var initialQuestions = [
    { type: 'input', name:'username', message:'Enter your Pocket user name:'},
    { type: 'input', name:'consumerKey', message:'Enter your Pocket App Consumer Key:'}
]

function login() {
    inquirer.prompt(initialQuestions, function( answers ) {
        getRequestToken(answers.consumerKey, function(err, requestCode) {
            if (err) {
                console.log(err);
                return;
            }

            console.log('Opening Pocket login window');
            open('http://localhost:8080/login')

            app.get('/login', function(req, res) {
                res.send('<script>document.location.href="https://getpocket.com/auth/authorize?request_token='+requestCode+'&redirect_uri=http://localhost:8080/auth";</script>');

                console.log('Request code', requestCode);

                getAuthToken(answers.consumerKey, requestCode, function(err, accessToken) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    console.log('Auth token', accessToken);

                    getItems(answers.consumerKey, accessToken, function(err, items) {
                        console.log('Writing items to items.json');
                        fs.writeFileSync(__dirname + '/items.json', JSON.stringify(items, null, 2), 'utf8');
                        console.log('Done');
                        process.exit();
                    })
                })
            });
        })
    });
}
