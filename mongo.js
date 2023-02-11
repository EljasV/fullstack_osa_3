const mongoose = require('mongoose')


if (process.argv.length < 3) {
  console.log('Need more arguments')
} else {
  const password = process.argv[2]

  const url = `mongodb+srv://Projekti:${password}@cluster0.rs2oasb.mongodb.net/?retryWrites=true&w=majority`


  mongoose.set('strictQuery', false)
  mongoose.connect(url)


  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Person = mongoose.model('Person', personSchema)

  if (process.argv.length === 3) {

    Person.find({}).then(result => {
      console.log('Phonebook:')
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
  } else {

    const p = new Person({name: process.argv[3], number: process.argv[4]})

    p.save().then(() => {
      console.log('Person saved!')
      mongoose.connection.close()
    })
  }
}


