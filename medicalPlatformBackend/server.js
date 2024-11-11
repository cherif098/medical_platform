import express from "express";
import cors from "cors";
import 'dotenv/config'


//App config
const app = express();
const port = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cors());

//api endpoints

app.get("/", (req, res) => {
    res.status(200).send("Hello from Medical Platform API");
});

//Listner
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})