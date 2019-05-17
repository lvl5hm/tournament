import React, { Component } from 'react';
import Table from '../components/Table/Table';
import store from '../store';
import time from '../time';

const getPotentialTeamCount = n => 2 ** Math.ceil(Math.log2(n));

export default class SprintTable extends Component {
  constructor(props) {
    super(props);
    store.subscribe(() => {
      for (let team of props.teams) {
        if (!team.results.sprint) {
          team.results.sprint = {
            parts: [],
          };
        }

        for (let sprintPart of team.results.sprint.parts) {
          if (!sprintPart) {
            continue;
          }
          sprintPart.timeNoPenalty = time.sub(sprintPart.finishTime, sprintPart.startTime);
          sprintPart.timeResult = time.add(sprintPart.penalty, sprintPart.timeNoPenalty);
        }
      }
    });

    store.update();
  }

  getRowsAndSortedTable(teams, part, lastPlace) {
    const potentialTeamCount = getPotentialTeamCount(teams.length);
    const passTeamCount = potentialTeamCount - teams.length;
    const competingTeamCount = teams.length - passTeamCount;

    const rows = [];
    const sortedTeamsStart = [];

    for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
      const team = teams[teamIndex];

      if (!team.results.sprint.parts[part]) {
        team.results.sprint.parts[part] = {
          startTime: time.zero(),
          finishTime: time.zero(),
          timeNoPenalty: time.zero(),
          penalty: time.zero(),
          timeResult: time.zero(),
          place: undefined,
          points: 0,
        };
      }

      let order = teamIndex;
      if (teamIndex >= passTeamCount) {
        const competingIndex = teamIndex - passTeamCount;
        if (competingIndex < competingTeamCount / 2) {
          order = passTeamCount + competingIndex * 2;
        } else {
          order = passTeamCount + (competingIndex - competingTeamCount / 2) * 2 + 1;
        }
      }

      sortedTeamsStart[order] = team;

      team.results.sprint.points = undefined;
      team.results.sprint.parts[part].points = undefined;
      team.results.sprint.parts[part].place = undefined;
    }


    const winners = teams.slice(0, passTeamCount);
    const losers = [];

    for (let i = passTeamCount; i < sortedTeamsStart.length; i++) {
      const a = sortedTeamsStart[i];
      const b = sortedTeamsStart[++i];

      if (time.gt(b.results.sprint.parts[part].timeResult, a.results.sprint.parts[part].timeResult)) {
        winners.push(a);
        losers.push(b);
      } else {
        winners.push(b);
        losers.push(a);
      }
    }

    // set the places

    const setTeamPointsAndPlace = (team, part, place) => {
      const points = store.settings.sprint.maxPoints - (Number(place) - 1) * store.settings.sprint.subtractPoints;

      team.results.sprint.parts[part].place = place;
      team.results.sprint.parts[part].points = points;
      team.results.sprint.points = points;
    }

    if (teams.length !== 4) {
      const sortedLosers = losers.sort((a, b) => time.sort(b.results.sprint.parts[part].timeResult, a.results.sprint.parts[part].timeResult));

      for (let loser of sortedLosers) {
        setTeamPointsAndPlace(loser, part, lastPlace--);
      }
    }
    if (winners.length === 1) {
      setTeamPointsAndPlace(winners[0], part, lastPlace--);
    }

    for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
      const team = teams[teamIndex];

      const results = team.results.sprint.parts[part];

      let order = teamIndex;
      if (teamIndex >= passTeamCount) {
        const competingIndex = teamIndex - passTeamCount;
        if (competingIndex < competingTeamCount / 2) {
          order = passTeamCount + competingIndex * 2;
        } else {
          order = passTeamCount + (competingIndex - competingTeamCount / 2) * 2 + 1;
        }
      }

      const fields = [
        {
          value: order + 1,
        },
        {
          value: team.number,
        },
        {
          value: team.name,
        },
        {
          value: team.subject,
        },
        {
          value: team.members.join(', '),
        },
        {
          value: time.string(results.startTime),
          onChange: v => { results.startTime = time.parse(v); store.update() },
        },
        {
          value: time.string(results.finishTime),
          onChange: v => { results.finishTime = time.parse(v); store.update() },
        },
        {
          value: time.string(results.timeNoPenalty),
        },
        {
          value: time.cpstring(results.penalty),
          onChange: v => { results.penalty = time.parse(v); store.update() },
        },
        {
          value: time.string(results.timeResult),
        },
        {
          value: results.place,
        },
        {
          value: results.points,
        },
      ];

      const rowStyle = {};
      const isWinner = winners.find(w => w.id === team.id);
      if (teamIndex < passTeamCount) {
        rowStyle.backgroundColor = 'gold';
      } else if (isWinner) {
        rowStyle.backgroundColor = 'lightgreen';
      } else {
        rowStyle.backgroundColor = 'white';
      }

      rows[order] = {
        cells: fields,
        style: rowStyle,
      };
    }

    return {
      rows,
      winners,
      losers,
    };
  }

  render() {
    const titleRowFields = [
      {
        value: '№',
        width: 30,
      },
      {
        value: '№ команды',
        width: 70,
      },
      {
        value: 'Название команды',
        width: 100,
      },
      {
        value: 'Субъект',
        width: 100,
      },
      {
        value: 'Состав',
        width: 150,
      },
      {
        value: 'Время старта',
        width: 80,
      },
      {
        value: 'Время финиша',
        width: 80,
      },
      {
        value: 'Время без штрафов',
        width: 80,
      },
      {
        value: 'Штрафы',
        width: 80,
      },
      {
        value: 'Итоговое время',
        width: 80,
      },
      {
        value: 'Место',
        width: 50,
      },
      {
        value: 'Очки',
        width: 50,
      },
    ];

    const teams = this.props.teams.slice().sort((a, b) => b.results.qualifiers.points - a.results.qualifiers.points);

    const tables = [];
    let lastResults = { winners: teams, losers: [] };
    let counter = 0;
    while (lastResults.winners.length >= 4) {
      lastResults = this.getRowsAndSortedTable(lastResults.winners, counter++, lastResults.winners.length);
      tables.push(lastResults.rows);
    }

    if (lastResults.winners.length === 3) {
      lastResults = this.getRowsAndSortedTable(lastResults.winners, counter++, 3);
      tables.push(lastResults.rows);
    } else {
      if (lastResults.losers.length) {
        const finaleBResult = this.getRowsAndSortedTable(lastResults.losers, counter++, 4);
        tables.push(finaleBResult.rows);
      }
    }

    if (lastResults.winners.length) {
      const finaleAResult = this.getRowsAndSortedTable(lastResults.winners, counter++, 2);
      tables.push(finaleAResult.rows);
    }

    return <div className="eventWrapper">
      <div className="categoryTitle">Параллельный спринт</div>
      {Boolean(tables.length) ? tables.map((t, i) => {
        const potentialTeamCount = getPotentialTeamCount(t.length);
        const finalPart = potentialTeamCount / 2;
        let text = `1 / ${finalPart} финала`;
        if (tables.length - i === 2) {
          text = 'Финал Б';
        }
        if (tables.length - i === 1) {
          text = 'Финал А';
        }

        return <div key={i}>
          {Boolean(tables.length) && <div className="sprintPartTitle">{text}</div>}
          <Table titleRow={{ cells: titleRowFields }} rows={t} />
        </div>;
      }) : 'Не добавлена ни одна команда'}
    </div>;
  }
}
