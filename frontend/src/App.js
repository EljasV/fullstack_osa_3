import {useState, useEffect} from 'react'
import contactService from "./services/contacts"


const Notification = ({message, style}) => {
    if (message === null) {
        return null
    }

    return (
        <div style={style}>
            {message}
        </div>
    )

}

function Filter(props) {
    return <div>
        Filter shown with <input value={props.value} onChange={(props.onChange)}/>
    </div>;
}


function ContactForm(props) {
    return <form>
        <h2>Add a new</h2>
        <div>
            name: <input value={props.nameValue} onChange={props.onNameChange}/>
        </div>
        <div>
            number: <input value={props.numberValue} onChange={props.onNumberChange}/>
        </div>
        <div>
            <button type="submit" onClick={props.onSubmitClicked}>add
            </button>
        </div>
    </form>;
}

function Contact({name, number, onDelete}) {
    return <li>{name} {number}
        <button onClick={onDelete}> Delete</button>
    </li>;
}


function ContactList(props) {
    const contacts = props.persons.filter(value => value.name.toLowerCase().includes(props.searchTerm.toLowerCase())).map((value) =>
        <Contact key={value.name} name={value.name} number={value.number}
                 onDelete={() => props.onContactDelete(value)}/>);
    return <ul>{contacts}</ul>;
}

function App() {

    const errorStyle = {
        color: "red",
        background: "lightgrey",
        fontSize: 20,
        borderStyle: "solid",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10
    }
    const goodStyle = {
        color: "green",
        background: "lightgrey",
        fontSize: 20,
        borderStyle: "solid",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10
    }

    const [persons, setPersons] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)
    const [goodMessage, setGoodMessage] = useState(null)

    useEffect(() => {
        contactService.getAll().then(initialPersons => setPersons(initialPersons))
    }, [])

    const onSubmitClicked = (event) => {
        event.preventDefault();
        if (persons.some(value => value.name === newName)) {
            if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
                const oldObj = persons.find(value => value.name === newName)
                const newObj = {...oldObj, number: newNumber}
                contactService.update(oldObj.id, newObj).then(returned => {
                    setPersons(persons.map(value => value.id !== oldObj.id ? value : returned));
                    setGoodMessage(`Updated ${oldObj.name}'s number`)
                    setTimeout(() => setGoodMessage(null), 3000)
                })
            }
        } else {
            const object = {name: newName, number: newNumber};
            contactService.create(object).then(value => {
                setPersons(persons.concat(value));
                setNewName("");
                setNewNumber("");
                setGoodMessage(`Added ${value.name}`)
                setTimeout(() => setGoodMessage(null), 3000)
            })
        }
    };
    const onContactDelete = (user) => {
        if (window.confirm(`Delete ${user.name}?`)) {
            contactService.remove(user.id).then(() => {
                setPersons(persons.filter(value => value.id !== user.id))
                setGoodMessage(`Removed ${user.name}`)
                setTimeout(() => setGoodMessage(null), 3000)
            }).catch(reason => {
                setErrorMessage(`${user.name} has already been removed from the server`)
                setTimeout(() => setErrorMessage(null), 3000)
                setPersons(persons.filter(value => value.id !== user.id))
            })
        }
    }


    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={goodMessage} style={goodStyle}/>
            <Notification message={errorMessage} style={errorStyle}/>
            <Filter value={searchTerm} onChange={event => setSearchTerm(event.target.value)}/>
            <ContactForm nameValue={newName} onNameChange={(event) => setNewName(event.target.value)}
                         numberValue={newNumber}
                         onNumberChange={event => setNewNumber(event.target.value)} onSubmitClicked={onSubmitClicked}/>
            <h2>Numbers</h2>
            <ContactList persons={persons} searchTerm={searchTerm} onContactDelete={onContactDelete}/>
        < /div>
    )

}

export default App