const app = require('./server/app');
const port = process.env.PORT || 4001;

app.listen(port, () => {
    console.log('Running on port :: ', port);
});