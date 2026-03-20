const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFile = path.join(__dirname, 'contacts.json');

// Настройка статики 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Настройка шаблонизатора [cite: 30, 32]
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main', // Общий макет 
    helpers: {
        cancelButton: () => '<a href="/" class="btn">Отказаться</a>' // Хелпер 
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

// Утилита для чтения/записи JSON
async function getContacts() {
    const data = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(data);
}
async function saveContacts(contacts) {
    await fs.writeFile(dataFile, JSON.stringify(contacts, null, 2));
}

// GET:/ [cite: 8, 26, 28]
app.get('/', async (req, res) => {
    const contacts = await getContacts();
    res.render('index', { contacts, isMain: true });
});

// GET:/Add [cite: 12, 26, 28]
app.get('/Add', async (req, res) => {
    const contacts = await getContacts();
    res.render('add', { contacts, isAdd: true }); // Строки-кнопки будут заблокированы [cite: 17]
});

// GET:/Update [cite: 18, 20, 26, 28]
app.get('/Update', async (req, res) => {
    const contacts = await getContacts();
    const contact = contacts.find(c => c.id === req.query.id);
    res.render('update', { contacts, isUpdate: true, contact });
});

// POST:/Add [cite: 15, 26]
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

// POST:/Update [cite: 21, 26]
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

// POST:/Delete [cite: 23, 26]
app.post('/Delete', async (req, res) => {
    let contacts = await getContacts();
    contacts = contacts.filter(c => c.id !== req.body.id);
    await saveContacts(contacts);
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); // Слушает порт 3000 [cite: 5]