const express = require("express")
const morgan = require("morgan")

const app = express()

app.use(express.json())

app.use(morgan(function (tokens, req, res) {
    let tiny = `${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} ${tokens.res(req, res, "content-length")} - ${tokens["response-time"](req, res)} ms`;
    if (tokens.method(req, res) === "POST") {
        tiny = tiny.concat(" ", JSON.stringify(req.body))
    }
    return tiny
}))

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.get("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(value => value.id === id);
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.get("/api/persons", (req, res) => {
    res.json(persons)
})

app.get("/info", (req, res) => {
    res.contentType("text/html")
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.delete("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(value => value.id !== id)

    res.status(204).end()
})

app.post("/api/persons", (req, res) => {
    const body = req.body
    if ((!body.name) || (!body.number) || persons.some(value => value.name === body.name)) {
        return res.status(400).json({error: "Person needs a name and a number. Name cannot be already present in the collection."})
    }
    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 1000000)
    }

    persons = persons.concat(person)
    res.json(person)

})


app.use(express.static("build"))


const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))