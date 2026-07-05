const https = require('https');
const fs = require('fs');
const path = require('path');

const API_TOKEN = process.env.FOOTBALL_API_TOKEN || 'YOUR_TOKEN_HERE';
const BASE_URL = 'https://api.football-data.org/v4';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'X-Auth-Token': API_TOKEN } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function getStageName(stage) {
  const map = {
    'GROUP_STAGE': '小组赛',
    'LAST_32': '32强',
    'LAST_16': '1/8决赛',
    'ROUND_OF_16': '1/8决赛',
    'QUARTER_FINALS': '1/4决赛',
    'SEMI_FINALS': '半决赛',
    'THIRD_PLACE': '季军赛',
    'FINAL': '决赛'
  };
  return map[stage] || stage;
}

function getGroupName(group) {
  if (!group) return '';
  return group.replace('GROUP_', '') + '组';
}

function formatDate(utcDate) {
  const d = new Date(utcDate);
  const beijing = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const month = beijing.getMonth() + 1;
  const day = beijing.getDate();
  const hours = String(beijing.getHours()).padStart(2, '0');
  const minutes = String(beijing.getMinutes()).padStart(2, '0');
  return { date: `${month}月${day}日`, time: `${hours}:${minutes}`, full: `${month}-${String(day).padStart(2, '0')} ${hours}:${minutes}` };
}

async function main() {
  console.log('Fetching World Cup data from football-data.org...');

  const [matchesData, standingsData, scorersData] = await Promise.all([
    fetch(`${BASE_URL}/competitions/WC/matches`),
    fetch(`${BASE_URL}/competitions/WC/standings`),
    fetch(`${BASE_URL}/competitions/WC/scorers?limit=10`)
  ]);

  const now = new Date();
  const beijingNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayStr = `${beijingNow.getFullYear()}-${String(beijingNow.getMonth() + 1).padStart(2, '0')}-${String(beijingNow.getDate()).padStart(2, '0')}`;

  const allMatches = matchesData.matches || [];
  const finished = allMatches.filter(m => m.status === 'FINISHED');
  const scheduled = allMatches.filter(m => m.status === 'TIMED' || m.status === 'SCHEDULED');
  const live = allMatches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');

  function processMatch(m) {
    const dateInfo = formatDate(m.utcDate);
    return {
      id: m.id,
      date: dateInfo.date,
      time: dateInfo.time,
      dateFull: dateInfo.full,
      stage: getStageName(m.stage),
      group: getGroupName(m.group),
      matchday: m.matchday,
      homeTeam: {
        name: m.homeTeam.name,
        shortName: m.homeTeam.shortName || m.homeTeam.name,
        tla: m.homeTeam.tla,
        crest: m.homeTeam.crest
      },
      awayTeam: {
        name: m.awayTeam.name,
        shortName: m.awayTeam.shortName || m.awayTeam.name,
        tla: m.awayTeam.tla,
        crest: m.awayTeam.crest
      },
      score: {
        home: m.score?.fullTime?.home,
        away: m.score?.fullTime?.away
      },
      halfTime: {
        home: m.score?.halfTime?.home,
        away: m.score?.halfTime?.away
      },
      winner: m.score?.winner,
      status: m.status,
      venue: m.venue || null
    };
  }

  const yesterday = new Date(beijingNow.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const yesterdayMatches = finished.filter(m => {
    const d = new Date(m.utcDate);
    const bd = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const ds = `${bd.getFullYear()}-${String(bd.getMonth() + 1).padStart(2, '0')}-${String(bd.getDate()).padStart(2, '0')}`;
    return ds === yesterdayStr;
  }).map(processMatch);

  const todayMatches = allMatches.filter(m => {
    const d = new Date(m.utcDate);
    const bd = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const ds = `${bd.getFullYear()}-${String(bd.getMonth() + 1).padStart(2, '0')}-${String(bd.getDate()).padStart(2, '0')}`;
    return ds === todayStr;
  }).map(processMatch);

  const upcomingMatches = scheduled.slice(0, 8).map(processMatch);

  const groups = {};
  (standingsData.standings || []).forEach(s => {
    if (s.type === 'TOTAL' && s.group) {
      const gName = getGroupName(s.group);
      groups[gName] = (s.table || []).map(t => ({
        position: t.position,
        team: {
          name: t.team.name,
          shortName: t.team.shortName || t.team.name,
          tla: t.team.tla,
          crest: t.team.crest
        },
        played: t.playedGames,
        won: t.won,
        draw: t.draw,
        lost: t.lost,
        goalsFor: t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        goalDifference: t.goalDifference,
        points: t.points
      }));
    }
  });

  const topScorers = (scorersData.scorers || []).slice(0, 10).map(s => ({
    name: s.player.name,
    team: s.team.name,
    teamTla: s.team.tla,
    crest: s.team.crest,
    goals: s.goals,
    assists: s.assists || 0,
    penalties: s.penalties || 0,
    playedMatches: s.playedMatches
  }));

  const totalGoals = finished.reduce((sum, m) => {
    return sum + (m.score?.fullTime?.home || 0) + (m.score?.fullTime?.away || 0);
  }, 0);

  const stats = {
    totalMatches: allMatches.length,
    finishedMatches: finished.length,
    totalGoals: totalGoals,
    avgGoals: finished.length > 0 ? (totalGoals / finished.length).toFixed(2) : '0',
    liveMatches: live.length
  };

  const stages = {};
  allMatches.forEach(m => {
    const sn = getStageName(m.stage);
    if (!stages[sn]) stages[sn] = { total: 0, finished: 0 };
    stages[sn].total++;
    if (m.status === 'FINISHED') stages[sn].finished++;
  });

  const result = {
    lastUpdated: new Date().toISOString(),
    lastUpdatedBeijing: `${beijingNow.getFullYear()}-${String(beijingNow.getMonth() + 1).padStart(2, '0')}-${String(beijingNow.getDate()).padStart(2, '0')} ${String(beijingNow.getHours()).padStart(2, '0')}:${String(beijingNow.getMinutes()).padStart(2, '0')}`,
    stats: stats,
    stages: stages,
    yesterdayMatches: yesterdayMatches,
    todayMatches: todayMatches,
    upcomingMatches: upcomingMatches,
    groups: groups,
    topScorers: topScorers
  };

  const outputPath = path.join(__dirname, '..', 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Data saved to data.json`);
  console.log(`  Finished: ${finished.length} matches`);
  console.log(`  Scheduled: ${scheduled.length} matches`);
  console.log(`  Live: ${live.length} matches`);
  console.log(`  Total goals: ${totalGoals}`);
  console.log(`  Groups: ${Object.keys(groups).length}`);
  console.log(`  Top scorers: ${topScorers.length}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
