// Packages
const expressValidator = require("express-validator");
const express = require("express");
const http = require('http')
const cors = require("cors");
require("dotenv").config();
const app = express();
const Fawn = require('fawn')
require('express-async-errors')
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const socketIO = require("socket.io");
// Import methods
const { dbConnection, errorHandler} = require('./middleware/helpers');

// Database Connection
dbConnection();

// our server instance
const server = http.createServer(app);
// This creates our socket using the instance of the server
const io = socketIO(server);
io.origins([`${process.env.ADMIN_CRM_ROUTE}`])



// Middlewares
const corsOptions = {
    methods: [ 'PUT', 'POST']
}
app.use(cors(corsOptions));
app.use((req,res,next)=>{
    req.io = io
    next()
})
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Ecom API",
            description: "ecommerce API information",
            contact: {
                name: "Amazing Developer"
            },
            servers: ["http://localhost:3001/api"]
        }
    },
    apis: ['./controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Routes
app.use("/api/admin-auth", require("./routes/admin_auth"));
app.use("/api/user-auth", require("./routes/user_auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/superadmin", require("./routes/superadmin"));
app.use("/api/user", require("./routes/user"));
app.use("/api/product", require("./routes/product"));
app.use("/api/order", require("./routes/order"));
app.use("/api/review-qna", require("./routes/review_qna"));
app.use("/api/cart-wishlist", require("./routes/cart_wishlist"));
app.use("/api/dispatcher-auth", require("./routes/dispatcher_auth"));

// logout for all types of user in the system
app.delete('/api/logout', async (req, res) => {
    const RefreshToken = require('./models/RefereshToken')
    const { refreshToken } = req.body
    await RefreshToken.deleteOne({ refreshToken })
    res.status(200).json({ msg: "Logged Out" })
})

// Error handling middleware
app.use(function (err, req, res, next) {
    console.log('****SERVER_ERROR****');
    console.log(err);
    if (err.message=='Not Image') {
        return res.status(415).json({error:'Images are only allowed'})
    }
    return res.status(500).json({
        error: errorHandler(err) || err.message || "Something went wrong!"
    });
})  



let roller = Fawn.Roller();
roller.roll()
.then(function () {
    // start server
    const port = process.env.PORT;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});