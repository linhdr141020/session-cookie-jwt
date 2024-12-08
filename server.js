const fs = require("fs")
const https = require("https")
const express = require("express")
const app = express()
const port = 3000
const cookieParser = require("cookie-parser")
const crypto = require("crypto")
var cors = require('cors')
const { base64url } = require("./helpers")
const jwtSecret = 'fA/W/G6UlsqQHRbYXBXuXrk2JhL8NHXFX6U2jLm/aun4knzZCfWLWGkov2zOCfVLmXdlO+iB40H1m0WSBXB1wWcumVeL3Bhsk0khrIHvKFcDRLCvvDREGoOS7vkv036Sd+eghBy9kmsKgHR6N9NX3wwA9cFPuHuKQ9K/UBE9SuHofVkjiXI6J8jKBK4JL88Q/fJK/NPjwev+kVOQNIcvJBbZnnXM61upFfl3zcWhnoeaYkDJt10o8n+r2vBkC2ndBlfv1v9p643VgOurTlnEToxMy2ctym/LAIUWR2F7dgFWPfTamnF6/3eUrOuCRS5CXk8iYpwipX1ulVl2HQTnsw==';
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

    const header = {
        alg: "HS256",
        typ: "JWT"
    }
    const payload = {
        sub: user.id,
        exp: Date.now() + 3600000
    }
    const encodedHeader = base64url(JSON.stringify(header))
    const encodePayload = base64url(JSON.stringify(payload))

    const tokenData = `${encodedHeader}.${encodePayload}`
    const hmac = crypto.createHmac("sha256", jwtSecret)
    const signature = hmac.update(tokenData).digest("base64url")

    res.json({
        token: `${tokenData}.${signature}`
    })
})
//[GET] /api/auth/me
app.get("/api/auth/me", (req, res) => {
    const token = req.headers.authorization?.slice(7)
    if (!token) {
        return res.status(401)
            .json({
                message: "Unauthorized"
            })
    }
    const [encodedHeader, encodePayload, tokenSignature] = token.split(".")
    const tokenData = `${encodedHeader}.${encodePayload}`
    const hmac = crypto.createHmac("sha256", jwtSecret)
    const signature = hmac.update(tokenData).digest("base64url")
    if (signature != tokenSignature) {
        return res.status(401)
            .json({
                message: "Unauthorized"
            })
    }
    const payload = JSON.parse(atob(encodePayload))
    const user = db.users.find(user => user.id == payload.sub)
    if (!user) {
        return res.status(401)
            .json({
                message: "Unauthorized"
            })
    }
    if(payload.exp < Date.now()){
        return res.status(401)
        .json({
            message: "Unauthorized"
        })
    }
    return res.json({ user })
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