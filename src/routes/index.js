module.exports = (server) => {
    server.get('/', (req, res) => {
       res.send('This is a project for Discord\'s 2019 Hack Week.');
    });
}
