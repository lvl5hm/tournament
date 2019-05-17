import React, { Component } from 'react';
import Table from '../components/Table/Table';
import store from '../store';
import time from '../time';

export default class TotalTable extends Component {
  render() {
    const teams = this.props.teams;

    const titleRow = [
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
        value: 'Квалификация',
        width: 100,
      },
      {
        value: 'Спринт',
        width: 100,
      },
      {
        value: 'Слалом',
        width: 100,
      },
      {
        value: 'Длинная гонка',
        width: 100,
      },
      {
        value: 'Всего',
        width: 100,
      },
    ];

    const totalPoints = {};
    for (let team of teams) {
      const qualifiers = team.results.qualifiers.points;
      const sprint = team.results.sprint.points;
      const slalom = team.results.slalom.points;
      const longRace = team.results.longRace.points;
      totalPoints[team.id] = qualifiers + sprint + slalom + longRace;
    }

    const sortedTeams = teams.slice().sort((a, b) => totalPoints[b.id] - totalPoints[a.id]);

    const rows = sortedTeams.map((team, teamIndex) => {
      const qualifiers = team.results.qualifiers.points;
      const sprint = team.results.sprint.points;
      const slalom = team.results.slalom.points;
      const longRace = team.results.longRace.points;

      const fields = [
        {
          value: teamIndex + 1,
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
          value: qualifiers,
        },
        {
          value: sprint,
        },
        {
          value: slalom,
        },
        {
          value: longRace,
        },
        {
          value: qualifiers + sprint + slalom + longRace,
        },
      ];

      return fields;
    });

    return <div className="eventWrapper">
      <div className="categoryTitle">Итоги</div>
      <Table titleRow={{ cells: titleRow }} rows={rows.map(r => ({ cells: r }))} />
    </div>
  }
}
