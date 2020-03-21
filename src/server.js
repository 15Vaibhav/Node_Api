const express = require('express');
require('./db/database');
const userRouter = require('./routers/user.route');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(userRouter);

app.listen(port, () => {
    console.log('Server started on port', port);
});
