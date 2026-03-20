const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs/promises');
const path = require('path');

const app = express();
// Порт должен быть динамическим для Vercel/Heroku
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'contacts.json');

// Настройка статики
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Настройка шаблонизатора
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    // Явное указание пути к partials для корректной работы в облаке
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        cancelButton: () => '<a href="/" class="btn">Отказаться</a>'
    }
}));
app.set('view engine', 'hbs');
// Явное указание пути к папке views
app.set('views', path.join(__dirname, 'views'));

// Утилита для чтения/записи JSON с обработкой ошибок
async function getContacts() {
    try {
        const data = await fs.readFile(dataFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Если файла нет или он пустой, возвращаем пустой массив
        return [];
    }
}
async function saveContacts(contacts) {
    await fs.writeFile(dataFile, JSON.stringify(contacts, null, 2));
}

// GET:/
app.get('/', async (req, res) => {
    const contacts = await getContacts();
    res.render('index', { contacts, isMain: true });
});

// GET:/Add
app.get('/Add', async (req, res) => {
    const contacts = await getContacts();
    res.render('add', { contacts, isAdd: true }); 
});

// GET:/Update
app.get('/Update', async (req, res) => {
    const contacts = await getContacts();
    const contact = contacts.find(c => c.id === req.query.id);
    // Если контакт не найден, возвращаемся на главную
    if (!contact) return res.redirect('/');
    res.render('update', { contacts, isUpdate: true, contact });
});

// POST:/Add
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

// POST:/Update
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

// POST:/Delete
app.post('/Delete', async (req, res) => {
    let contacts = await getContacts();
    contacts = contacts.filter(c => c.id !== req.body.id);
    await saveContacts(contacts);
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));