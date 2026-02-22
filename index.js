import express from 'express';

const host = "0.0.0.0";
const porta = 3000;
const server = express();

server.get('/', (requisicao, resposta) => {
  const { idade, sexo, salario_base, anoContratacao, matricula } = requisicao.query;
  const temParams = idade || sexo || salario_base || anoContratacao || matricula;

  if (!temParams) {
    resposta.send(`
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reajuste Salarial</title>
        <style>
          .url-exemplo { color: #0066cc; }
        </style>
      </head>
      <body>
        <h1>Calculadora de Reajuste Salarial</h1>
        <p>Para calcular o reajuste de um funcionário, informe os dados na URL do seu navegador conforme o exemplo abaixo:</p>

        <p class="url-exemplo">http://localhost:3000/?idade=18&amp;sexo=F&amp;salario_base=1700&amp;anoContratacao=2014&amp;matricula=12345</p>

        <h2>Parâmetros necessários:</h2>
        <ul>
          <li><b>idade</b> — número inteiro maior que 16</li>
          <li><b>sexo</b> — M (masculino) ou F (feminino)</li>
          <li><b>salario_base</b> — número real válido e positivo</li>
          <li><b>anoContratacao</b> — número inteiro maior que 1960</li>
          <li><b>matricula</b> — número inteiro maior que 0</li>
        </ul>

        <h2>Reajustes por faixa etária:</h2>
        <p>Faixa 18 a 39 anos — Masculino: reajuste de 10%, desconto de R$ 10,00 (até 10 anos) ou acréscimo de R$ 17,00 (mais de 10 anos)</p>
        <p>Faixa 18 a 39 anos — Feminino: reajuste de 8%, desconto de R$ 11,00 (até 10 anos) ou acréscimo de R$ 16,00 (mais de 10 anos)</p>
        <p>Faixa 40 a 69 anos — Masculino: reajuste de 8%, desconto de R$ 5,00 (até 10 anos) ou acréscimo de R$ 15,00 (mais de 10 anos)</p>
        <p>Faixa 40 a 69 anos — Feminino: reajuste de 10%, desconto de R$ 7,00 (até 10 anos) ou acréscimo de R$ 14,00 (mais de 10 anos)</p>
        <p>Faixa 70 a 99 anos — Masculino: reajuste de 15%, desconto de R$ 15,00 (até 10 anos) ou acréscimo de R$ 13,00 (mais de 10 anos)</p>
        <p>Faixa 70 a 99 anos — Feminino: reajuste de 17%, desconto de R$ 17,00 (até 10 anos) ou acréscimo de R$ 12,00 (mais de 10 anos)</p>
      </body>
      </html>
    `);
    return;
  }

  const erros = [];
  const idadeNum = parseInt(idade);
  const salarioNum = parseFloat(salario_base);
  const anoNum = parseInt(anoContratacao);
  const matriculaNum = parseInt(matricula);

  if (!idade || isNaN(idadeNum) || idadeNum <= 16) erros.push('A idade deve ser um número inteiro maior que 16.');
  if (!sexo || (sexo !== 'M' && sexo !== 'F')) erros.push('O sexo deve ser M ou F.');
  if (!salario_base || isNaN(salarioNum) || salarioNum <= 0) erros.push('O salário base deve ser um número real válido e positivo.');
  if (!anoContratacao || isNaN(anoNum) || anoNum <= 1960) erros.push('O ano de contratação deve ser inteiro e maior que 1960.');
  if (!matricula || isNaN(matriculaNum) || matriculaNum <= 0) erros.push('A matrícula deve ser um número inteiro maior que 0.');
  if (!isNaN(idadeNum) && idadeNum > 16 && (idadeNum < 18 || idadeNum > 99)) erros.push('Faixa etária fora da tabela. Faixas aceitas: 18–39, 40–69 e 70–99 anos.');

  if (erros.length > 0) {
    resposta.write(`
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dados inválidos</title>
        <style>
          a { color: #0066cc; }
        </style>
      </head>
      <body>
        <h1>Não foi possível calcular o reajuste</h1>
        <p>Os seguintes problemas foram encontrados nos dados informados:</p>
        <ul>
    `);
    for (var i = 0; i < erros.length; i++) {
      resposta.write('<li>' + erros[i] + '</li>');
    }
    resposta.write(`
        </ul>
        <a href="/">← Voltar e ver as instruções</a>
      </body>
      </html>
    `);
    resposta.end();
    return;
  }

  const anoAtual = new Date().getFullYear();
  const anosNaEmpresa = anoAtual - anoNum;
  const maisde10Anos = anosNaEmpresa > 10;

  var reajustePercent = 0;
  var desconto = 0;
  var acrescimo = 0;

  if (idadeNum >= 18 && idadeNum <= 39) {
    if (sexo === 'M') { reajustePercent = 10; desconto = 10.00; acrescimo = 17.00; }
    else              { reajustePercent = 8;  desconto = 11.00; acrescimo = 16.00; }
  } else if (idadeNum >= 40 && idadeNum <= 69) {
    if (sexo === 'M') { reajustePercent = 8;  desconto = 5.00;  acrescimo = 15.00; }
    else              { reajustePercent = 10; desconto = 7.00;  acrescimo = 14.00; }
  } else if (idadeNum >= 70 && idadeNum <= 99) {
    if (sexo === 'M') { reajustePercent = 15; desconto = 15.00; acrescimo = 13.00; }
    else              { reajustePercent = 17; desconto = 17.00; acrescimo = 12.00; }
  }

  const reajusteValor = salarioNum * (reajustePercent / 100);
  var novoSalario = salarioNum + reajusteValor;

  if (maisde10Anos) {
    novoSalario += acrescimo;
  } else {
    novoSalario -= desconto;
  }

  const diff = novoSalario - salarioNum;

  resposta.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resultado — Matrícula ${matriculaNum}</title>
      <style>
        a { color: #0066cc; }
      </style>
    </head>
    <body>
      <h1>Resultado do Reajuste Salarial</h1>

      <h2>Dados do funcionário</h2>
      <p>Matrícula: ${matriculaNum}</p>
      <p>Idade: ${idadeNum} anos</p>
      <p>Sexo: ${sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
      <p>Salário base: R$ ${salarioNum.toFixed(2)}</p>
      <p>Ano de contratação: ${anoNum}</p>
      <p>Anos na empresa: ${anosNaEmpresa} anos</p>

      <h2>Cálculo do reajuste</h2>
      <p>Faixa etária: ${idadeNum <= 39 ? '18–39' : idadeNum <= 69 ? '40–69' : '70–99'} anos</p>
      <p>Reajuste percentual: ${reajustePercent}% — + R$ ${reajusteValor.toFixed(2)}</p>
      <p>Situação na empresa: ${maisde10Anos ? 'Mais de 10 anos' : 'Até 10 anos'}</p>
      <p>${maisde10Anos ? 'Acréscimo' : 'Desconto'}: ${maisde10Anos ? '+ R$ ' + acrescimo.toFixed(2) : '- R$ ' + desconto.toFixed(2)}</p>

      <h2>Novo salário reajustado: R$ ${novoSalario.toFixed(2)}</h2>
      <p>Aumento total de R$ ${diff.toFixed(2)} em relação ao salário base</p>

      <a href="/">← Nova consulta</a>
    </body>
    </html>
  `);
});

server.listen(porta, host, () => {
  console.log(`Servidor escutando em http://${host}:${porta}`);
});

server.get('/', (requisicao, resposta) => {
  const { idade, sexo, salario_base, anoContratacao, matricula } = requisicao.query;
  const temParams = idade || sexo || salario_base || anoContratacao || matricula;

  if (!temParams) {
    resposta.send(`
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reajuste Salarial</title>
        <style>
          .url-exemplo { color: #0066cc; }
        </style>
      </head>
      <body>
        <h1>Calculadora de Reajuste Salarial</h1>
        <p>Para calcular o reajuste de um funcionário, informe os dados na URL conforme o exemplo abaixo:</p>

        <p class="url-exemplo">http://localhost:3000/?idade=18&amp;sexo=F&amp;salario_base=1700&amp;anoContratacao=2014&amp;matricula=12345</p>

        <h2>Parâmetros necessários:</h2>
        <ul>
          <li><b>idade</b> — número inteiro maior que 16</li>
          <li><b>sexo</b> — M (masculino) ou F (feminino)</li>
          <li><b>salario_base</b> — número real válido e positivo</li>
          <li><b>anoContratacao</b> — número inteiro maior que 1960</li>
          <li><b>matricula</b> — número inteiro maior que 0</li>
        </ul>

        <h2>Reajustes por faixa etária:</h2>
        <p>Faixa 18 a 39 anos — Masculino: reajuste de 10%, desconto de R$ 10,00 (até 10 anos) ou acréscimo de R$ 17,00 (mais de 10 anos)</p>
        <p>Faixa 18 a 39 anos — Feminino: reajuste de 8%, desconto de R$ 11,00 (até 10 anos) ou acréscimo de R$ 16,00 (mais de 10 anos)</p>
        <p>Faixa 40 a 69 anos — Masculino: reajuste de 8%, desconto de R$ 5,00 (até 10 anos) ou acréscimo de R$ 15,00 (mais de 10 anos)</p>
        <p>Faixa 40 a 69 anos — Feminino: reajuste de 10%, desconto de R$ 7,00 (até 10 anos) ou acréscimo de R$ 14,00 (mais de 10 anos)</p>
        <p>Faixa 70 a 99 anos — Masculino: reajuste de 15%, desconto de R$ 15,00 (até 10 anos) ou acréscimo de R$ 13,00 (mais de 10 anos)</p>
        <p>Faixa 70 a 99 anos — Feminino: reajuste de 17%, desconto de R$ 17,00 (até 10 anos) ou acréscimo de R$ 12,00 (mais de 10 anos)</p>
      </body>
      </html>
    `);
    return;
  }

  const erros = [];
  const idadeNum = parseInt(idade);
  const salarioNum = parseFloat(salario_base);
  const anoNum = parseInt(anoContratacao);
  const matriculaNum = parseInt(matricula);

  if (!idade || isNaN(idadeNum) || idadeNum <= 16) erros.push('A idade deve ser um número inteiro maior que 16.');
  if (!sexo || (sexo !== 'M' && sexo !== 'F')) erros.push('O sexo deve ser M ou F.');
  if (!salario_base || isNaN(salarioNum) || salarioNum <= 0) erros.push('O salário base deve ser um número real válido e positivo.');
  if (!anoContratacao || isNaN(anoNum) || anoNum <= 1960) erros.push('O ano de contratação deve ser inteiro e maior que 1960.');
  if (!matricula || isNaN(matriculaNum) || matriculaNum <= 0) erros.push('A matrícula deve ser um número inteiro maior que 0.');
  if (!isNaN(idadeNum) && idadeNum > 16 && (idadeNum < 18 || idadeNum > 99)) erros.push('Faixa etária fora da tabela. Faixas aceitas: 18–39, 40–69 e 70–99 anos.');

  if (erros.length > 0) {
    resposta.write(`
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dados inválidos</title>
        <style>
          a { color: #0066cc; }
        </style>
      </head>
      <body>
        <h1>Não foi possível calcular o reajuste</h1>
        <p>Os seguintes problemas foram encontrados nos dados informados:</p>
        <ul>
    `);
    for (var i = 0; i < erros.length; i++) {
      resposta.write('<li>' + erros[i] + '</li>');
    }
    resposta.write(`
        </ul>
        <a href="/">← Voltar e ver as instruções</a>
      </body>
      </html>
    `);
    resposta.end();
    return;
  }

  const r = calcularReajuste(idadeNum, sexo, salarioNum, anoNum);
  const diff = r.novoSalario - salarioNum;

  resposta.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resultado — Matrícula ${matriculaNum}</title>
      <style>
        a { color: #0066cc; }
      </style>
    </head>
    <body>
      <h1>Resultado do Reajuste Salarial</h1>

      <h2>Dados do funcionário</h2>
      <p>Matrícula: ${matriculaNum}</p>
      <p>Idade: ${idadeNum} anos</p>
      <p>Sexo: ${sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
      <p>Salário base: R$ ${salarioNum.toFixed(2)}</p>
      <p>Ano de contratação: ${anoNum}</p>
      <p>Anos na empresa: ${r.anosNaEmpresa} anos</p>

      <h2>Cálculo do reajuste</h2>
      <p>Faixa etária: ${idadeNum <= 39 ? '18–39' : idadeNum <= 69 ? '40–69' : '70–99'} anos</p>
      <p>Reajuste percentual: ${r.reajustePercent}% — + R$ ${r.reajusteValor.toFixed(2)}</p>
      <p>Situação na empresa: ${r.maisde10Anos ? 'Mais de 10 anos' : 'Até 10 anos'}</p>
      <p>${r.maisde10Anos ? 'Acréscimo' : 'Desconto'}: ${r.maisde10Anos ? '+ R$ ' + r.acrescimo.toFixed(2) : '- R$ ' + r.desconto.toFixed(2)}</p>

      <h2>Novo salário reajustado: R$ ${r.novoSalario.toFixed(2)}</h2>
      <p>Aumento total de R$ ${diff.toFixed(2)} em relação ao salário base</p>

      <a href="/">← Nova consulta</a>
    </body>
    </html>
  `);
});

server.listen(porta, host, () => {
  console.log(`Servidor escutando em http://${host}:${porta}`);
});