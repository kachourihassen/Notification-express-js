    const express = require('express');
    const app = express();

    app.use(express.json());
    app.use("/api",require("./routes/app.routes"));
    app.listen(4000,function() {
        console.log('Server running on port 4000');
    });