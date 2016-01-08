# pocket-viz

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Visualizes you [Pocket](https://getpocket.com) added vs archived article counts

## Usage

### Downloading your Pocket items

1. Go to https://getpocket.com/developer/apps/ and create new webapp

2. Run `node get-items.js` and enter your Pocket `USER_NAME` and your new app's `CONSUMER_KEY`

3. After that a bowser window should open for you to authenticate the app

4. After successful authentication you can go back to the console (the browser window/tab will close itself)

5. When the downloading is complete there will be `items.json` file with all your articles

```bash
$ node get-items.js
Listening on port 8080
? Enter your Pocket user name: USER_NAME
? Enter your Pocket App Consumer Key: CONSUMER_KEY
Getting request token...
Opening Pocket login window
Request code XXXXXXXX-XXXX-XXXX-XXXX-XXXXXX
Getting auth token...
Auth token XXXXXXXX-XXXX-XXXX-XXXX-XXXXXX
Getting items..
Getting items from 0 to 1000
Getting items from 1000 to 2000
Getting items from 2000 to 3000
Getting items from 3000 to 4000
Getting items from 4000 to 5000
Getting items from 5000 to 6000
Getting items from 6000 to 7000
Getting items from 7000 to 8000
Getting items from 8000 to 9000
Getting items from 9000 to 10000
Getting items from 10000 to 11000
Total items 10105
Writing items to items.json
Done
```

### Visualization

1. Run `node visualize.js` to generate your graph to `pocket-viz.svg`


```bash
$node visualize.js
Generating pocket-viz.svg
Done
```

## License

MIT, see [LICENSE.md](http://github.com/vorg/pocket-viz/blob/master/LICENSE.md) for details.
