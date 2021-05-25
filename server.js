require("dotenv").config();
const express = require("express");
const cors=require("cors");
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

mongoose
    .connect(process.env.URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      console.log('mongodb connected and running');
    })
    .catch((err) => {
      throw err;
    });
// middlewares
app.use(express.json({ extended: false }));
app.use(cors());
// route included
app.use('/payment', require("./routes/payment"));

app.listen(port, () => console.log(`server started on port ${port}`));