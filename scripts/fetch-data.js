const https = require('https');
const fs = require('fs');
const path = require('path');

const API_TOKEN = process.env.FOOTBALL_API_TOKEN || '2e38ac7c7bc149f4810a2024e2041251';
const BASE_URL = 'https://api.football-data.org/v4';

const TEAM_CN = {
  'Mexico':'墨西哥','South Africa':'南非','South Korea':'韩国','Korea Republic':'韩国',
  'Czechia':'捷克','Switzerland':'瑞士','Canada':'加拿大',
  'Bosnia-Herzegovina':'波黑','Bosnia-H.':'波黑','Qatar':'卡塔尔',
  'Brazil':'巴西','Morocco':'摩洛哥','Scotland':'苏格兰','Haiti':'海地',
  'United States':'美国','Australia':'澳大利亚','Paraguay':'巴拉圭',
  'Turkey':'土耳其','Germany':'德国','Ivory Coast':'科特迪瓦',
  'Ecuador':'厄瓜多尔','Curacao':'库拉索',
  'Netherlands':'荷兰','Japan':'日本','Sweden':'瑞典','Tunisia':'突尼斯',
  'Belgium':'比利时','Egypt':'埃及','Iran':'伊朗','New Zealand':'新西兰',
  'Spain':'西班牙','Cape Verde Islands':'佛得角','Cape Verde':'佛得角',
  'Uruguay':'乌拉圭','Saudi Arabia':'沙特阿拉伯',
  'France':'法国','Norway':'挪威','Senegal':'塞内加尔','Iraq':'伊拉克',
  'Argentina':'阿根廷','Austria':'奥地利','Algeria':'阿尔及利亚','Jordan':'约旦',
  'Colombia':'哥伦比亚','Portugal':'葡萄牙','Congo DR':'刚果民主共和国',
  'Uzbekistan':'乌兹别克斯坦','England':'英格兰','Croatia':'克罗地亚',
  'Ghana':'加纳','Panama':'巴拿马','Italy':'意大利','Serbia':'塞尔维亚',
  'Poland':'波兰','Greece':'希腊','Iceland':'冰岛','Hungary':'匈牙利',
  'Wales':'威尔士','Peru':'秘鲁','Chile':'智利','Cameroon':'喀麦隆',
  'Nigeria':'尼日利亚','China PR':'中国'
};

const PLAYER_CN = {
  'Kylian Mbappe':'姆巴佩','Kylian Mbappé':'姆巴佩',
  'Lionel Messi':'梅西','Erling Haaland':'哈兰德',
  'Harry Kane':'哈里·凯恩','Vinicius Junior':'维尼修斯',
  'Mikel Oyarzabal':'奥亚萨巴尔',
  'Ousmane Dembele':'登贝莱','Ousmane Dembélé':'登贝莱',
  'Ismaila Sarr':'萨尔','Ismaïla Sarr':'萨尔',
  'Julian Quinones':'基尼奥内斯','Julián Quiñones':'基尼奥内斯',
  'Folarin Balogun':'巴洛贡','Bruno Guimaraes':'布鲁诺·吉马良斯','Bruno Guimarães':'布鲁诺·吉马良斯',
  'Pedri':'佩德里','Gavi':'加维','Jude Bellingham':'贝林厄姆',
  'Phil Foden':'福登','Bukayo Saka':'萨卡','Florian Wirtz':'维尔茨',
  'Jamal Musiala':'穆西亚拉','Neymar':'内马尔','Raphinha':'拉菲尼亚',
  'Rodri':'罗德里','Dani Olmo':'奥尔莫','Lamine Yamal':'亚马尔',
  'Cole Palmer':'帕尔默','Alvaro Morata':'莫拉塔','Álvaro Morata':'莫拉塔',
  'Federico Valverde':'巴尔韦德','Darwin Nunez':'努涅斯','Darwin Núñez':'努涅斯',
  'Antoine Griezmann':'格列兹曼','Olivier Giroud':'吉鲁',
  'Robert Lewandowski':'莱万多夫斯基','Cristiano Ronaldo':'C罗',
  'Kevin De Bruyne':'德布劳内','Romelu Lukaku':'卢卡库',
  'Thomas Muller':'穆勒','Thomas Müller':'穆勒',
  'Toni Kroos':'克罗斯','Joshua Kimmich':'基米希',
  'Kai Havertz':'哈弗茨','Mohamed Salah':'萨拉赫','Sadio Mane':'马内','Sadio Mané':'马内',
  'Son Heung-min':'孙兴慜','Lee Kang-in':'李刚仁','Kim Min-jae':'金玟哉',
  'Granit Xhaka':'扎卡','Xherdan Shaqiri':'沙奇里',
  'Unai Simon':'乌奈·西蒙','Unai Simón':'乌奈·西蒙',
  'Jan Oblak':'奥布拉克','Thibaut Courtois':'库尔图瓦',
  'Manuel Neuer':'诺伊尔','Alisson':'阿利松','Ederson':'埃德松',
  'Emiliano Martinez':'马丁内斯','Emiliano Martínez':'马丁内斯',
  'Luka Modric':'莫德里奇','Luka Modrić':'莫德里奇',
  'Josko Gvardiol':'格瓦迪奥尔','Joško Gvardiol':'格瓦迪奥尔',
  'Joao Felix':'费利克斯','João Félix':'费利克斯',
  'Rafael Leao':'莱昂','Rafael Leão':'莱昂',
  'Bruno Fernandes':'布鲁诺·费尔南德斯','Bernardo Silva':'贝尔纳多·席尔瓦',
  'Wataru Endo':'远藤航','Kaoru Mitoma':'三笘薫',
  'Hwang Hee-chan':'黄喜灿','Neymar Jr':'内马尔',
  'Vinicius Jr':'维尼修斯','Vinícius Jr':'维尼修斯',
  'Richarlison':'里沙利松','Lucas Paqueta':'帕奎塔','Lucas Paquetá':'帕奎塔',
  'Casemiro':'卡塞米罗','Marquinhos':'马尔基尼奥斯',
  'Thiago Silva':'蒂亚戈·席尔瓦','Gabriel Jesus':'热苏斯',
  'Lautaro Martinez':'劳塔罗','Lautaro Martínez':'劳塔罗',
  'Julian Alvarez':'阿尔瓦雷斯','Julián Álvarez':'阿尔瓦雷斯',
  'Enzo Fernandez':'恩佐','Enzo Fernández':'恩佐',
  'Alexis Mac Allister':'麦卡利斯特','Rodrigo De Paul':'德保罗',
  'Nicolas Otamendi':'奥塔门迪','Nicolás Otamendi':'奥塔门迪',
  'Cristian Romero':'罗梅罗',
  'Nicolas Tagliafico':'塔利亚菲科','Nicolás Tagliafico':'塔利亚菲科',
  'Gonzalo Montiel':'蒙铁尔','Nahuel Molina':'莫利纳',
  'Leandro Paredes':'帕雷德斯','Paulo Dybala':'迪巴拉',
  'Angel Di Maria':'迪马利亚','Ángel Di María':'迪马利亚',
  'Diogo Jota':'若塔','Ruben Dias':'迪亚斯','Rúben Dias':'迪亚斯',
  'Raphael Guerreiro':'格雷罗','Raphaël Guerreiro':'格雷罗',
  'Goncalo Ramos':'贡萨洛·拉莫斯','Gonçalo Ramos':'贡萨洛·拉莫斯',
  'Vitinha':'维蒂尼亚','Manuel Ugarte':'乌加尔特',
  'Diogo Costa':'迪奥戈·科斯塔',
  'Marcos Acuna':'阿库尼亚','Marcos Acuña':'阿库尼亚',
  'Lisandro Martinez':'利桑德罗','Lisandro Martínez':'利桑德罗',
  'Deniz Undav':'翁达夫','Johan Manzambi':'曼赞比',
  'Cody Gakpo':'加克波','Breel Embolo':'恩博洛',
  'Crysencio Summerville':'萨默维尔','Maximiliano Araújo':'阿劳霍',
  'Ramin Rezaeian':'雷扎伊安','Bradley Barcola':'巴尔科拉',
  'Ruben Vargas':'巴尔加斯','Ayase Ueda':'上田绮世',
  'Soufiane Rahimi':'拉希米','Nicolas Pépé':'佩佩',
  'Pape Gueye':'盖耶','Leandro Trossard':'特罗萨德',
  'Riyad Mahrez':'马赫雷斯','In-beom Hwang':'黄仁范',
  'Mbappe':'姆巴佩','Messi':'梅西','Haaland':'哈兰德',
  'Kane':'凯恩','Vinicius':'维尼修斯','Griezmann':'格列兹曼',
  'Ronaldo':'C罗','Salah':'萨拉赫','Lukaku':'卢卡库',
  'Lewandowski':'莱万','Neymar':'内马尔','Bellingham':'贝林厄姆',
  'Foden':'福登','Saka':'萨卡','Palmer':'帕尔默','Yamal':'亚马尔',
  'Wirtz':'维尔茨','Musiala':'穆西亚拉','Pedri':'佩德里','Gavi':'加维'
};

const TLA_CN = {
  'MEX':'墨西哥','RSA':'南非','KOR':'韩国','CZE':'捷克',
  'SUI':'瑞士','CAN':'加拿大','BIH':'波黑','QAT':'卡塔尔',
  'BRA':'巴西','MAR':'摩洛哥','SCO':'苏格兰','HAI':'海地',
  'USA':'美国','AUS':'澳大利亚','PAR':'巴拉圭','TUR':'土耳其',
  'GER':'德国','CIV':'科特迪瓦','ECU':'厄瓜多尔','CUW':'库拉索',
  'NED':'荷兰','JPN':'日本','SWE':'瑞典','TUN':'突尼斯',
  'BEL':'比利时','EGY':'埃及','IRN':'伊朗','NZL':'新西兰',
  'ESP':'西班牙','CPV':'佛得角','URU':'乌拉圭','KSA':'沙特阿拉伯',
  'FRA':'法国','NOR':'挪威','SEN':'塞内加尔','IRQ':'伊拉克',
  'ARG':'阿根廷','AUT':'奥地利','ALG':'阿尔及利亚','JOR':'约旦',
  'COL':'哥伦比亚','POR':'葡萄牙','COD':'刚果民主共和国',
  'UZB':'乌兹别克斯坦','ENG':'英格兰','CRO':'克罗地亚',
  'GHA':'加纳','PAN':'巴拿马'
};

function cnTeam(name) { return (name && TEAM_CN[name]) ? TEAM_CN[name] : name; }
function cnPlayer(name) { return (name && PLAYER_CN[name]) ? PLAYER_CN[name] : name; }
function cnTla(tla) { return (tla && TLA_CN[tla]) ? TLA_CN[tla] : tla; }

function fetch(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const req = https.get(url, { headers: { 'X-Auth-Token': API_TOKEN } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 429 && n > 0) {
            console.log('Rate limited, retrying in 2s...');
            setTimeout(() => attempt(n - 1), 2000);
            return;
          }
          if (res.statusCode !== 200) {
            const err = new Error('HTTP ' + res.statusCode + ' for ' + url);
            if (n > 0) { console.log('Retrying after error...'); setTimeout(() => attempt(n - 1), 1000); return; }
            reject(err);
            return;
          }
          try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
        });
      });
      req.on('error', (e) => {
        if (n > 0) { console.log('Retrying after', e.message); setTimeout(() => attempt(n - 1), 1000); return; }
        reject(e);
      });
      req.setTimeout(20000, () => { req.destroy(); if (n > 0) { setTimeout(() => attempt(n - 1), 1000); return; } reject(new Error('Timeout')); });
    };
    attempt(retries);
  });
}

function getStageName(stage) {
  const map = { 'GROUP_STAGE':'小组赛','LAST_32':'32强','LAST_16':'1/8决赛',
    'ROUND_OF_16':'1/8决赛','QUARTER_FINALS':'1/4决赛','SEMI_FINALS':'半决赛',
    'THIRD_PLACE':'季军赛','FINAL':'决赛' };
  return map[stage] || stage;
}

function getGroupName(group) { return group ? group.replace('GROUP_','') + '组' : ''; }

function toBeijing(utcDate) {
  const d = new Date(utcDate);
  const b = new Date(d.getTime() + 8*60*60*1000);
  return {
    year: b.getUTCFullYear(), month: b.getUTCMonth()+1, day: b.getUTCDate(),
    hours: b.getUTCHours(), minutes: b.getUTCMinutes()
  };
}

function formatDate(utcDate) {
  const bj = toBeijing(utcDate);
  const mm = String(bj.minutes).padStart(2,'0');
  return { date: bj.month+'月'+bj.day+'日', time: bj.hours+':'+mm, full: bj.month+'-'+String(bj.day).padStart(2,'0')+' '+bj.hours+':'+mm };
}

function toCnTeam(teamObj) {
  const n = cnTeam(teamObj.name);
  const byTla = cnTla(teamObj.tla);
  const name = n !== teamObj.name ? n : (byTla !== teamObj.tla ? byTla : teamObj.name);
  return { name: name, shortName: name, tla: teamObj.tla, crest: teamObj.crest };
}

async function main() {
  console.log('Fetching World Cup data...');

  const matchesData = await fetch(BASE_URL+'/competitions/WC/matches');
  await new Promise(r => setTimeout(r, 600));
  const standingsData = await fetch(BASE_URL+'/competitions/WC/standings');
  await new Promise(r => setTimeout(r, 600));
  const scorersData = await fetch(BASE_URL+'/competitions/WC/scorers?limit=50');

  const now = new Date();
  const bjNow = toBeijing(now);
  const todayStr = bjNow.year+'-'+String(bjNow.month).padStart(2,'0')+'-'+String(bjNow.day).padStart(2,'0');

  const allMatches = matchesData.matches || [];
  const finished = allMatches.filter(m => m.status==='FINISHED');
  const scheduled = allMatches.filter(m => m.status==='TIMED'||m.status==='SCHEDULED');
  const live = allMatches.filter(m => m.status==='IN_PLAY'||m.status==='PAUSED');

  function processMatch(m) {
    const di = formatDate(m.utcDate);
    return {
      id: m.id, date: di.date, time: di.time, dateFull: di.full,
      stage: getStageName(m.stage), group: getGroupName(m.group), matchday: m.matchday,
      homeTeam: toCnTeam(m.homeTeam),
      awayTeam: toCnTeam(m.awayTeam),
      score: { home: m.score?.fullTime?.home, away: m.score?.fullTime?.away },
      halfTime: { home: m.score?.halfTime?.home, away: m.score?.halfTime?.away },
      winner: m.score?.winner, status: m.status, venue: m.venue||null
    };
  }

  const yesterdayMs = new Date(now.getTime() + 8*60*60*1000).getTime() - 24*60*60*1000;
  const yesterdayBj = new Date(yesterdayMs);
  const yesterdayStr = yesterdayBj.getUTCFullYear()+'-'+String(yesterdayBj.getUTCMonth()+1).padStart(2,'0')+'-'+String(yesterdayBj.getUTCDate()).padStart(2,'0');

  const yesterdayMatches = finished.filter(m => {
    const bj = toBeijing(m.utcDate);
    return bj.year+'-'+String(bj.month).padStart(2,'0')+'-'+String(bj.day).padStart(2,'0') === yesterdayStr;
  }).map(processMatch);

  const todayMatches = allMatches.filter(m => {
    const bj = toBeijing(m.utcDate);
    return bj.year+'-'+String(bj.month).padStart(2,'0')+'-'+String(bj.day).padStart(2,'0') === todayStr;
  }).map(processMatch);

  const upcomingMatches = scheduled.slice(0,8).map(processMatch);

  const groups = {};
  (standingsData.standings||[]).forEach(s => {
    if (s.type==='TOTAL' && s.group) {
      groups[getGroupName(s.group)] = (s.table||[]).map(t => ({
        position: t.position,
        team: toCnTeam(t.team),
        played: t.playedGames, won: t.won, draw: t.draw, lost: t.lost,
        goalsFor: t.goalsFor, goalsAgainst: t.goalsAgainst,
        goalDifference: t.goalDifference, points: t.points
      }));
    }
  });

  const topScorers = (scorersData.scorers||[]).map(s => ({
    name: cnPlayer(s.player.name) || s.player.name,
    team: cnTeam(s.team.name) || cnTla(s.team.tla) || s.team.name,
    teamTla: s.team.tla, crest: s.team.crest,
    goals: s.goals, assists: s.assists||0, penalties: s.penalties||0, playedMatches: s.playedMatches
  }));

  const totalGoals = finished.reduce((sum,m) => sum+(m.score?.fullTime?.home||0)+(m.score?.fullTime?.away||0), 0);

  const stages = {};
  allMatches.forEach(m => {
    const sn = getStageName(m.stage);
    if (!stages[sn]) stages[sn] = { total:0, finished:0 };
    stages[sn].total++;
    if (m.status==='FINISHED') stages[sn].finished++;
  });

  const teamGoals = {};
  finished.forEach(m => {
    if (m.score?.winner === 'PENS') return;
    const h = m.homeTeam.name, a = m.awayTeam.name;
    const hg = m.score?.fullTime?.home || 0;
    const ag = m.score?.fullTime?.away || 0;
    if (!teamGoals[h]) teamGoals[h] = { team: toCnTeam(m.homeTeam), goals: 0, played: 0 };
    if (!teamGoals[a]) teamGoals[a] = { team: toCnTeam(m.awayTeam), goals: 0, played: 0 };
    teamGoals[h].goals += hg;
    teamGoals[h].played++;
    teamGoals[a].goals += ag;
    teamGoals[a].played++;
  });
  const teamGoalsRank = Object.values(teamGoals).sort((a, b) => b.goals - a.goals).slice(0, 10);

  const knockoutMatches = allMatches
    .filter(m => m.stage !== 'GROUP_STAGE')
    .sort((a,b) => new Date(b.utcDate) - new Date(a.utcDate))
    .slice(0, 16)
    .map(processMatch);

  function generateMatchEvents(m) {
    const events = [];
    if (m.status !== 'FINISHED') return events;
    const ht = m.score?.halfTime || {};
    const ft = m.score?.fullTime || {};
    const homeHT = ht.home || 0, awayHT = ht.away || 0;
    const homeFT = ft.home || 0, awayFT = ft.away || 0;
    const homeSecond = homeFT - homeHT, awaySecond = awayFT - awayHT;

    if (homeHT > 0 || awayHT > 0) {
      events.push({ type: 'halftime', text: '半场 ' + homeHT + '-' + awayHT });
    }
    if (homeSecond > 0 || awaySecond > 0) {
      events.push({ type: 'fulltime', text: '全场 ' + homeFT + '-' + awayFT });
    }
    if (m.winner === 'HOME_TEAM') {
      events.push({ type: 'result', text: m.homeTeam.shortName + ' 晋级' });
    } else if (m.winner === 'AWAY_TEAM') {
      events.push({ type: 'result', text: m.awayTeam.shortName + ' 晋级' });
    } else if (m.winner === 'PENALTIES') {
      events.push({ type: 'result', text: '点球大战决胜' });
    }
    const totalGoals = homeFT + awayFT;
    if (totalGoals >= 3) {
      events.push({ type: 'highlight', text: '全场共 ' + totalGoals + ' 粒进球' });
    }
    return events;
  }

  const matchEvents = {};
  finished.forEach(m => {
    const evts = generateMatchEvents(m);
    if (evts.length > 0) matchEvents[String(m.id)] = evts;
  });

  const result = {
    lastUpdated: new Date().toISOString(),
    lastUpdatedBeijing: bjNow.year+'-'+String(bjNow.month).padStart(2,'0')+'-'+String(bjNow.day).padStart(2,'0')+' '+String(bjNow.hours).padStart(2,'0')+':'+String(bjNow.minutes).padStart(2,'0'),
    stats: { totalMatches:allMatches.length, finishedMatches:finished.length, totalGoals, avgGoals:finished.length>0?(totalGoals/finished.length).toFixed(2):'0', liveMatches:live.length },
    stages, knockoutMatches, matchEvents, yesterdayMatches, todayMatches, upcomingMatches, groups, topScorers, teamGoalsRank
  };

  fs.writeFileSync(path.join(__dirname,'..','data.json'), JSON.stringify(result,null,2), 'utf8');
  console.log('Done!');
}

main().catch(err => { console.error('Error:',err.message); process.exit(1); });
