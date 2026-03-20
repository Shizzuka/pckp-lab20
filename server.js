const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs/promises');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'contacts.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        cancelButton: () => '<a href="/" class="btn">Отказаться</a>'
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

async function getContacts() {
    try {
        const data = await fs.readFile(dataFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        
        return [];
    }
}
async function saveContacts(contacts) {
    await fs.writeFile(dataFile, JSON.stringify(contacts, null, 2));
}

app.get('/', async (req, res) => {
    const contacts = await getContacts();
    res.render('index', { contacts, isMain: true });
});

app.get('/Add', async (req, res) => {
    const contacts = await getContacts();
    res.render('add', { contacts, isAdd: true }); 
});

app.get('/Update', async (req, res) => {
    const contacts = await getContacts();
    const contact = contacts.find(c => c.id === req.query.id);
    // Если контакт не найден, возвращаемся на главную
    if (!contact) return res.redirect('/');
    res.render('update', { contacts, isUpdate: true, contact });
});

app.post('/Add', async (req, res) => {
    const contacts = await getContacts();
    const newContact = {
        id: Date.now().toString(),
        name: req.body.name,
        phone: req.body.phone
    };
    contacts.push(newContact);
    await saveContacts(contacts);
    res.redirect('/');
});

app.post('/Update', async (req, res) => {
    const contacts = await getContacts();
    const index = contacts.findIndex(c => c.id === req.body.id);
    if (index !== -1) {
        contacts[index].name = req.body.name;
        contacts[index].phone = req.body.phone;
        await saveContacts(contacts);
    }
    res.redirect('/');
});

app.post('/Delete', async (req, res) => {
    let contacts = await getContacts();
    contacts = contacts.filter(c => c.id !== req.body.id);
    await saveContacts(contacts);
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));