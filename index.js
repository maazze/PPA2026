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


  // criar um método que aceita parâmetros
   server.get('/tabuada', (requisicao, resposta) => {
   // tabuada de qual número e até qual sequência
   const numero = parseInt(requisicao.query.numero);
   const sequencia = parseInt(requisicao.query.sequencia);
   console.log("requisição tabuada:");
   if (!numero || !sequencia){
    resposta.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabuada</title>
    </head>
    <body>
    <h1>Por favor informe o número e a sequência</h1>
    <h3>Exemplo: http://localhost:3000/tabuada?numero=9&sequencia=100</h3>
    </body>
    </html>
      `);
   }

else{
resposta.setHeader('Content-type','text/html');
resposta.write(`
<!DOCTYPE html>
    <html lang="pt-br">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabuada</title>
    </head>
    <body>
    <h1>Tabuada do ${numero} até a sequencia ${sequencia}</h1>
    <ul>
  `);

  for (let i=0; i<= sequencia;i++){
    resposta.write(`<li>${i} x ${numero} = ${i * numero}</li>`);
  }

  resposta.write(`
    </html>
    </body>
    </html>
`);

resposta.end(); //finaliza e envia
}

  });
server.listen(porta, host, () => {
  console.log(`Servidor escutando em http://${host}:${porta}`);
});