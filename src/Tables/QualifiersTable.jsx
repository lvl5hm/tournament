import React, { Component } from 'react';
import Table from '../components/Table/Table';
import store from '../store';
import time from '../time';

window.time = time;

export default class QualifiersTable extends Component {
  constructor(props) {
    super(props);
    store.subscribe(() => {
      for (let team of props.teams) {
        if (!team.results.qualifiers) {
          team.results.qualifiers = {
            startTime: time.zero(),
            finishTime: time.zero(),
            checkpoints: [],
            points: 0,
          };
        }
        const results = team.results.qualifiers;

        results.penaltySum = results.checkpoints.reduce((sum, c) => time.add(sum, c), time.zero());
        results.timeNoPenalty = time.sub(results.finishTime, results.startTime);
        results.timeResult = time.add(results.penaltySum, results.timeNoPenalty);
      }

      const sorted = this.props.teams.slice().sort((a, b) => time.sort(a.results.qualifiers.timeResult, b.results.qualifiers.timeResult));

      for (let team of this.props.teams) {
        const results = team.results.qualifiers;

        results.place = sorted.findIndex(t => t.id === team.id) + 1;
        results.points = store.settings.qualifiers.maxPoints - (results.place - 1) * store.settings.qualifiers.subtractPoints;
      }
    });

    store.update();
  }

  render() {
    const teams = this.props.teams;
    const settings = store.settings.qualifiers;

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
        value: 'Время без штрафов',
        width: 80,
      },
    ];
    for (let i = 0; i < settings.checkpointCount; i++) {
      titleRow.push({ value: i + 1, width: 25 });
    }
    titleRow.push(...[
      {
        value: 'Сумма штрафов',
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
    ]);

    const rows = teams.map((team, teamIndex) => {
      const results = team.results.qualifiers;

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
          value: time.string(results.timeNoPenalty),
        },
      ];

      for (let i = 0; i < settings.checkpointCount; i++) {
        fields.push({
          value: time.cpstring(results.checkpoints[i]),
          onChange: v => { results.checkpoints[i] = time.parse(v); store.update() },
        });
      }

      fields.push(...[
        {
          value: time.string(results.penaltySum),
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
      ]);

      return fields;
    });

    return <div className="eventWrapper">
      <div className="categoryTitle">Квалификация</div>
      <Table titleRow={{ cells: titleRow }} rows={rows.map(r => ({ cells: r }))} />
    </div>;
  }
}
