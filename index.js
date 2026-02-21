import express from 'express';

const host = "0.0.0.0";
const porta = 3000;

const server = express();

server.get('/', (requisicao, resposta) => {
  resposta.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>primeiro programa para internet usando node + express</title>
      </head>
      <body>
        <h1>Primeiro programa para internet usando node + express</h1>
        <h2>Olá, bem-vindo a página inicial</h2>
      </body>
    </html>
  `);
});

server.get('/horaAtual', (requisicao, resposta) => {
    const horaAtual = new Date ();
    const hora = horaAtual.getHours () +":" + horaAtual.getMinutes () +":" + horaAtual.getSeconds ();
     resposta.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Horário do servidor</title>
      </head>
      <body>
        <h1>Agora são ${hora}</h1>
      </body>
    </html>
      `);
    });

server.listen(porta, host, () => {
  console.log(`Servidor escutando em http://${host}:${porta}`);
});