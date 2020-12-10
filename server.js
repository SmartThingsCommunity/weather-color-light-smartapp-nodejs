const smartApp = require('./smartapp');
const express = require('express');
const server = express();
const PORT = process.env.PORT || 3005;


/* Express server used for local testing only */
server.use(express.json());
server.post('/', (req, res, next) => {
    smartApp.handleHttpCallback(req, res);
});

server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
