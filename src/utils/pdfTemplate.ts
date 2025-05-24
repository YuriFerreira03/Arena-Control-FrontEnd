export const buildSumulaHtml = (s) => {
  const total = s.periods.reduce(
    (acc, p) => ({
      goalsA: acc.goalsA + Number(p.goalsA || 0),
      goalsB: acc.goalsB + Number(p.goalsB || 0),
      foulsA: acc.foulsA + Number(p.foulsA || 0),
      foulsB: acc.foulsB + Number(p.foulsB || 0),
      timeoutsA: acc.timeoutsA + Number(p.timeoutsA || 0),
      timeoutsB: acc.timeoutsB + Number(p.timeoutsB || 0),
    }),
    { goalsA: 0, goalsB: 0, foulsA: 0, foulsB: 0, timeoutsA: 0, timeoutsB: 0 }
  );

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>Súmula</title>
  <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Roboto', sans-serif; color: #2c3e50; background: #ecf0f1; padding: 24px; }
    h1, h2 { font-weight: 500; color: #34495e; }
    h1 { font-size: 28px; margin-bottom: 16px; }
    h2 { font-size: 20px; margin-bottom: 8px; border-bottom: 2px solid #bdc3c7; padding-bottom: 4px; }

    .header {
      background: linear-gradient(90deg, #2980b9, #6dd5fa);
      color: white; padding: 16px; border-radius: 8px;
      display: flex; flex-direction: column; align-items: center;
      margin-bottom: 24px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .header .title { font-size: 32px; font-weight: 700; }
    .header .teams { font-size: 24px; margin-top: 8px; }

    .info-bar {
      display: flex; flex-wrap: wrap; justify-content: space-between;
      background: white; padding: 12px 16px; border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-bottom: 24px;
    }
    .info-item { flex: 1 1 45%; margin: 4px 0; font-size: 14px; }
    .info-item strong { color: #2c3e50; }

    table {
      width: 100%; border-collapse: collapse; margin-top: 12px;
      background: white; border-radius: 6px; overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    th, td {
      padding: 8px 6px; text-align: center; font-size: 13px;
    }
    thead { background: #2980b9; }
    thead th { color: white; font-weight: 500; }
    tbody tr:nth-child(even) { background: #ecf0f1; }

    .section { margin-bottom: 24px; }
    .section h2 { margin-bottom: 12px; }

    .card-icons { font-size: 16px; margin-left: 4px; }
    .yellow { color: #f1c40f; }
    .red { color: #e74c3c; }
  </style>
</head>
<body>

  <div class="header">
    <div class="title">Súmula Oficial</div>
    <div class="teams">⚽ ${total.goalsA} ${s.teamA} (A) x (B) ${s.teamB} ${total.goalsB} ⚽</div>
  </div>

  <div class="info-bar">
    <div class="info-item"><strong>Competição:</strong> ${s.competition || '-'}</div>
    <div class="info-item"><strong>Categoria:</strong> ${s.category || '-'}</div>
    <div class="info-item"><strong>Data:</strong> ${s.date ? new Date(s.date).toLocaleDateString('pt-BR') : '-'}</div>
    <div class="info-item"><strong>Local:</strong> ${s.venue || '-'}</div>
    <div class="info-item"><strong>Árbitro:</strong> ${s.referee || '-'}</div>
    <div class="info-item"><strong>Resultado Final:</strong> ${total.goalsA} x ${total.goalsB}</div>
  </div>

  <div class="section">
    <h2>📊 Resultados por Período</h2>
    <table>
      <thead>
        <tr>
          <th>PERÍODO</th><th>GOLS A</th><th>GOLS B</th>
          <th>FALTA A</th><th>FALTA B</th><th>TEMPO A</th><th>TEMPO B</th>
        </tr>
      </thead>
      <tbody>
        ${s.periods.map(p => `
          <tr>
            <td>${p.period}</td>
            <td>${p.goalsA}</td><td>${p.goalsB}</td>
            <td>${p.foulsA}</td><td>${p.foulsB}</td>
            <td>${p.timeoutsA}</td><td>${p.timeoutsB}</td>
          </tr>
        `).join('')}
        <tr style="font-weight:bold;">
          <td>Total</td>
          <td>${total.goalsA}</td><td>${total.goalsB}</td>
          <td>${total.foulsA}</td><td>${total.foulsB}</td>
          <td>${total.timeoutsA}</td><td>${total.timeoutsB}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>👥 Atletas – Equipe A</h2>
    <table>
      <thead>
        <tr><th>NÚMERO</th><th>NOME</th><th>AMARELO</th><th>VERMELHO</th></tr>
      </thead>
      <tbody>
        ${s.playersA.map(p => `
          <tr>
            <td>${p.number}</td>
            <td style="text-align:left;padding-left:12px;">${p.name}</td>
            <td class="card-icons">${p.yellow > 0 ? `<span class="yellow">🟨 ${p.yellow}x</span>` : ''}</td>
            <td class="card-icons">${p.red    ? '<span class="red">🟥</span>' : ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>👥 Atletas – Equipe B</h2>
    <table>
      <thead>
        <tr><th>NÚMERO</th><th>NOME</th><th>AMARELO</th><th>VERMELHO</th></tr>
      </thead>
      <tbody>
        ${s.playersB.map(p => `
          <tr>
            <td>${p.number}</td>
            <td style="text-align:left;padding-left:12px;">${p.name}</td>
            <td class="card-icons">${p.yellow > 0 ? `<span class="yellow">🟨 ${p.yellow}x</span>` : ''}</td>
            <td class="card-icons">${p.red    ? '<span class="red">🟥</span>' : ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📝 Observações</h2>
    <div style="background:white;padding:12px;border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.05);">
      ${s.notes ? s.notes.replace(/\n/g, '<br/>') : '<em>— Sem observações —</em>'}
    </div>
  </div>

</body>
</html>
`;
};
