const fs = require("fs") 
const https = require("https")
const express = require("express")
const app = express()
const port = 3000
const cookieParser = require("cookie-parser")
var cors = require('cors')

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(express.json())

app.get("/", (req, res) => {
    res.render("pages/index")
})

app.get("/login", (req, res) => {
    res.render("pages/login")
})

app.get("/logout", (req, res) => {
    delete sessions[req.cookies.sessionId]
    res.setHeader("Set-Cookie", "sessionId=;max-age=0").redirect("/login")
})

app.get("/dashboard", (req, res) => {
    const session = sessions[req.cookies.sessionId]
    if (!session) {
        return res.redirect("/login")
    }
    const user = db.users.find(user => user.id = session.userId)
    if (!user) {
        return res.redirect("/login")
    }

    res.render("pages/dashboard", { user })
})
//Fake db (MySQL, MongDB)
const db = {
    users: [
        {
            id: 1,
            email: "levanlinh@gmail.com",
            password: 123456, //PLAN TEXT, HASH
            name: "Linh"
        },
        {
            id: 1,
            email: "linhvan le",
            password: 654321,
            name: "Huyen"
        }
    ],
    posts: [
        {
            id: 1,
            title: "Title 1",
            description: "Description 1"
        },
        {
            id: 2,
            title: "Title 2",
            description: "Description 2"
        },
        {
            id: 3,
            title: "Title 3",
            description: "Description 3"
        }
    ]
}

app.get("/api/posts", (req, res) => {
    res.json(db.posts)
})

// Session
//[POST] /api/auth/login
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body
    const user = db.users.find((user) => user.email == email && user.password == password)
    if (!user) {
        return res.status(401)
            .json({
                message: "Unauthorized"
            })
    }

    const sessionId = Date.now().toString()
    sessions[sessionId] = { sub: user.id }


    res.setHeader("Set-Cookie", `sessionId=${sessionId};httpOnly; max-age=3600`).json(user)
})
//[GET] /api/auth/me
app.get("/api/auth/me", (req, res) => {
    const session = sessions[req.cookies.sessionId]
    if (!session) {
        return res.status(401)
            .json({
                message: "Unauthorized"
            })
    }
    const user = db.users.find(user => user.id == session.sub)

    if (!session) {
        return res.status(401)
            .json({
                message: "Unauthorized"
            })
    }
    res.json(user)
})

//Session
const sessions = {}
app.post("/login", (req, res) => {
    const { email, password } = req.body
    const user = db.users.find(
        (user) => user.email == email && user.password == password
    )
    if (user) {
        const sessionId = Date.now().toString()
        sessions[sessionId] = {
            userId: user.id
        }

        res.setHeader("Set-Cookie", `sessionId=${sessionId};Max-Age=3600; HttpOnly;`)
            .redirect("/dashboard")
        return
    }
    res.send("Invalid");
})
// https
//     .createServer({
//         key: fs.readFileSync("testcookie.com+2-key.pem"),
//         cert: fs.readFileSync("testcookie.com+2.pem")
//     })
//     .listen(port, () => {
//         console.log(`Demo app runnng ${port}`);
//     })

app.listen(3000, () => {
    console.log("Demo app running 3000");
})