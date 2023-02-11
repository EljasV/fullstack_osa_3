require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const Person = require("./models/person")
const app = express()

app.use(express.static("build"))
app.use(express.json())
//requestLogger
app.use(morgan(function (tokens, req, res) {
    let tiny = `${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} ${tokens.res(req, res, "content-length")} - ${tokens["response-time"](req, res)} ms`;
    if (tokens.method(req, res) === "POST") {
        tiny = tiny.concat(" ", JSON.stringify(req.body))
    }
    return tiny
}))

app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {

            res.json(person)
        } else {
            res.status(404).end()
        }
    }).catch(error => next(error))

})

app.get("/api/persons", (req, res, next) => {
    Person.find({}).then(value => {
        res.json(value)
    }).catch(error => next(error))
})

app.get("/info", (req, res, next) => {
    res.contentType("text/html")
    Person.countDocuments({})
        .then(value => {
            res.send(`<p>Phonebook has info for ${value} people</p><p>${new Date()}</p>`);
        })
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndDelete(req.params.id).then(value => {
        res.status(204).end()
    }).catch(error => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
    const body = req.body
    Person.findByIdAndUpdate(req.params.id, {name: body.name, number: body.number}, {new: true})
        .then(value => {
            res.json(value)
        })
        .catch(error => next(error))
})

app.post("/api/persons", (req, res, next) => {
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(person)
    }).catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === "CastError") {
        return response.status.send({error: "Malformatted id"})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))