const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const PORT = 3000;

//Allow all origins
app.use(cors());

// Redirecționează cererile pentru client către Microserviciul 1
app.use('/search/client', createProxyMiddleware({
    target: 'http://microservice1:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/search/client': '/'
    },
    onProxyReq: (proxyReq, req, res) => {
        if (req.query.name) {
            // Adaugă parametrul 'name' la URL-ul țintă
            proxyReq.path += `?name=${encodeURIComponent(req.query.name)}`;
        }
    }
}));

// Redirecționează cererile pentru companie către Microserviciul 2
app.use('/search/company', createProxyMiddleware({
    target: 'http://microservice2:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/search/company': ''
    }
}));

// Acest middleware este pentru tratarea cererilor care nu se potrivesc niciunei rute definite anterior
app.use((req, res) => {
    res.status(404).send('Serviciu inexistent');
});

// Pornirea serverului pe portul specificat
app.listen(PORT, () => {
    console.log(`API Gateway ruleaza pe portul ${PORT}`);
});
