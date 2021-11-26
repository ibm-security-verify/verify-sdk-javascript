const express = require('express');
const bodyParser = require('body-parser');


const app = express();

// Add JSON middleware, since we'll be handling JSON requests
app.use(express.json());

app.use(bodyParser.urlencoded({extended: true})); // For simple form posts

// Define a static route for the Browser SDK npm module, so it can be served
// from a static webpage
app.use('/static/adaptive-v1.min.js', express.static(
    __dirname + '/node_modules/adaptive-browser-sdk/dist/adaptive-v1.min.js'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const port = 3000;
app.listen(port, console.log(`Listening on port ${port}...`));
