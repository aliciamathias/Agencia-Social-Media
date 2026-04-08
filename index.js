express = require('express');
app = express();

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

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

app.get('/orcamento', (req, res) => {
    res.render('orcamento');
});

app.post('/login', (req, res) => {
    res.send(`
        <h1>Login realizado com sucesso!</h1>
        <a href="/">Voltar para o site</a>
    `);
});

app.post('/cadastro', (req, res) => {
    res.send(`<h1>Cadastro realizado com sucesso!</h1>
        <a href="/">Voltar para o site</a>`);
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

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});