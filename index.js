

const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017').trim();
const DB_NAME = (process.env.MONGODB_DB || 'wolfdb').trim();

let db;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/orcamento', (req, res) => {
    res.render('orcamento');
});

app.get('/perfil', (req, res) => {
    res.render('perfil');
})

app.post('/login', (req, res) => {
    res.send(`
        <h1>Login realizado com sucesso!</h1>
        <a href="/">Voltar para o site</a>
    `);
});

app.get('/cadastro', (req, res) => {
    const ok = req.query.ok === '1';
    res.render('cadastro', { error: null, ok, values: null });
});

app.post('/cadastro', async (req, res) => {
    const nome = (req.body.nome || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const senha = req.body.senha || '';
    const senha2 = req.body.senha2 || '';

    const values = { nome, email };

    if (!nome || !email || !senha) {
        return res.status(400).render('cadastro', {
            error: 'Preencha nome, e-mail e senha.',
            ok: false,
            values,
        });
    }
    if (senha !== senha2) {
        return res.status(400).render('cadastro', {
            error: 'As senhas não coincidem.',
            ok: false,
            values,
        });
    }
    if (senha.length < 6) {
        return res.status(400).render('cadastro', {
            error: 'A senha deve ter pelo menos 6 caracteres.',
            ok: false,
            values,
        });
    }

    try {
        const passwordHash = await bcrypt.hash(senha, 10);
        await db.collection('users').insertOne({
            nome,
            email,
            passwordHash,
            createdAt: new Date(),
        });
        return res.redirect('/cadastro?ok=1');
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).render('cadastro', {
                error: 'Este e-mail já está cadastrado.',
                ok: false,
                values,
            });
        }
        console.error(err);
        return res.status(500).render('cadastro', {
            error: 'Não foi possível concluir o cadastro. Tente novamente.',
            ok: false,
            values,
        });
    }
});


app.post('/orcamento', (req, res) => {
    const servicos = req.body.servicos;

    if (!servicos) {
        return res.send(`
            <h1>Erro</h1>
            <p>Selecione pelo menos um serviço.</p>
            <a href="/orcamento">Tentar novamente</a>
        `);
    }

    res.send(`
        <h1>Orçamento solicitado com sucesso!</h1>
        <p>Serviços escolhidos: ${servicos}</p>
        <a href="/">Voltar para o site</a>
    `);
});

async function main() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    await db.collection('users').createIndex({ email: 1 }, { unique: true }); // Não pode existir 2 usuários com mesmo e-mail

    app.listen(3000, () => {
        console.log('Example app listening on port 3000!');
    });
}

main().catch((err) => {
    console.error('Falha ao iniciar:', err);
    process.exit(1);
});