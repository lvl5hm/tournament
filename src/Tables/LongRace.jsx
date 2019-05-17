import React, { Component } from 'react';
import Table from '../components/Table/Table';
import store from '../store';
import time from '../time';

export default class LongRaceTable extends Component {
  constructor(props) {
    super(props);
    store.subscribe(() => {
      for (let team of props.teams) {
        if (!team.results.longRace) {
          team.results.longRace = {
            startTime: time.zero(),
            finishTime: time.zero(),
            timeResult: time.zero(),
            points: 0,
          };
        }
        const results = team.results.longRace;

        results.timeResult = time.sub(results.finishTime, results.startTime);
      }

      const sorted = props.teams.slice().sort((a, b) => time.sort(a.results.longRace.timeResult, b.results.longRace.timeResult));

      for (let team of props.teams) {
        const results = team.results.longRace;

        results.place = sorted.findIndex(t => t.id === team.id) + 1;
        results.points = store.settings.longRace.maxPoints - (results.place - 1) * store.settings.longRace.subtractPoints;
      }
    });

    store.update();
  }

  render() {
    const teams = this.props.teams.slice().sort((a, b) => b.results.slalom.points - a.results.slalom.points);;
    const settings = store.settings.longRace;

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
        value: 'Время старта',
        width: 80,
      },
      {
        value: 'Время финиша',
        width: 80,
      },
      {
        value: 'Время на дистанции',
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

    const rows = teams.map((team, teamIndex) => {
      const results = team.results.longRace;

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
          value: time.string(results.startTime),
          onChange: v => { results.startTime = time.parse(v); store.update() },
        },
        {
          value: time.string(results.finishTime),
          onChange: v => { results.finishTime = time.parse(v); store.update() },
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

      return fields;
    });

    return <div className="eventWrapper">
      <div className="categoryTitle">Длинная гонка</div>
      <Table titleRow={{ cells: titleRow }} rows={rows.map(r => ({ cells: r }))} />
    </div>
  }
}
