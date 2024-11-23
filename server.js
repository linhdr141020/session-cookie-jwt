const express = require("express")
const app = express()
const port = 3000
const cookieParser = require("cookie-parser")

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("pages/index")
})

app.get("/login", (req, res) => {    
    res.render("pages/login")
})

app.get("/logout", (req, res) => { 
    console.log('logout');
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
//Fake db
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
    ]
}

//Session
const sessions = {}
app.post("/login", (req, res) => {
    const { email, password } = req.body
    console.log(email, password);
    const user = db.users.find(
        (user) => user.email == email && user.password == password
    )

    if (user) {
        const sessionId = Date.now().toString()
        sessions[sessionId] = {
            userId: user.id
        }
        console.log(sessions);

        res.setHeader("Set-Cookie", `sessionId=${sessionId};max-age=3600; httpOnly`)
            .redirect("/dashboard")
        return
    }
    res.send("Invalid");
})

app.listen(3000, () => {
    console.log("Demo app runnng 3000");
})