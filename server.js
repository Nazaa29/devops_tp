const { app } = require('./app');
const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

module.exports = server;
    