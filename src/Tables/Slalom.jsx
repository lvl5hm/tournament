import React, { Component } from 'react';
import Table from '../components/Table/Table';
import store from '../store';
import time from '../time';

export default class SlalomTable extends Component {
  constructor(props) {
    super(props);
    store.subscribe(() => {
      for (let team of props.teams) {
        if (!team.results.slalom) {
          team.results.slalom = {
            attempts: [
              {
                startTime: time.zero(),
                finishTime: time.zero(),
                checkpoints: [],
              },
              {
                startTime: time.zero(),
                finishTime: time.zero(),
                checkpoints: [],
              },
            ],
            points: 0,
          };
        }
        const results = team.results.slalom;

        for (let attemptIndex = 0; attemptIndex < 2; attemptIndex++) {
          const attempt = results.attempts[attemptIndex];
          attempt.penaltySum = attempt.checkpoints.reduce((sum, c) => time.add(sum, c), time.zero());
          attempt.timeNoPenalty = time.sub(attempt.finishTime, attempt.startTime);
          attempt.timeResult = time.add(attempt.penaltySum, attempt.timeNoPenalty);
        }

        results.bestResult = time.min(results.attempts[0].timeResult, results.attempts[1].timeResult);
      }

      const sorted = props.teams.slice().sort((a, b) => time.sort(a.results.slalom.bestResult, b.results.slalom.bestResult));

      for (let team of props.teams) {
        const results = team.results.slalom;

        results.place = sorted.findIndex(t => t.id === team.id) + 1;
        results.points = store.settings.slalom.maxPoints - (results.place - 1) * store.settings.slalom.subtractPoints;
      }
    });

    store.update();
  }

  render() {
    const teams = this.props.teams.slice().sort((a, b) => b.results.sprint.points - a.results.sprint.points);
    const settings = store.settings.slalom;

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
        width: 50,
      },
      {
        value: 'Итоговое время',
        width: 50,
      },
      {
        value: 'Лучшее время',
        width: 50,
      },
      {
        value: 'Место',
        width: 20,
      },
      {
        value: 'Очки',
        width: 50,
      },
    ]);

    const rows = [];
    teams.forEach((team, teamIndex) => {
      const results = team.results.slalom;

      const fields = [
        {
          value: teamIndex + 1,
          rowSpan: 2,
        },
        {
          value: team.number,
          rowSpan: 2,
        },
        {
          value: team.name,
          rowSpan: 2,
        },
        {
          value: team.subject,
          rowSpan: 2,
        },
        {
          value: team.members.join(', '),
          rowSpan: 2,
        },
        {
          value: time.string(results.attempts[0].startTime),
          onChange: v => { results.attempts[0].startTime = time.parse(v); store.update() },
        },
        {
          value: time.string(results.attempts[0].finishTime),
          onChange: v => { results.attempts[0].finishTime = time.parse(v); store.update() },
        },
        {
          value: time.string(results.attempts[0].timeNoPenalty),
        },
      ];

      const secondFields = [
        {
          value: time.string(results.attempts[1].startTime),
          onChange: v => { results.attempts[1].startTime = time.parse(v); store.update() },
        },
        {
          value: time.string(results.attempts[1].finishTime),
          onChange: v => { results.attempts[1].finishTime = time.parse(v); store.update() },
        },
        {
          value: time.string(results.attempts[1].timeNoPenalty),
        },
      ];

      for (let i = 0; i < settings.checkpointCount; i++) {
        fields.push({
          value: time.cpstring(results.attempts[0].checkpoints[i]),
          onChange: v => { results.attempts[0].checkpoints[i] = time.parse(v); store.update() },
        });

        secondFields.push({
          value: time.cpstring(results.attempts[1].checkpoints[i]),
          onChange: v => { results.attempts[1].checkpoints[i] = time.parse(v); store.update() },
        });
      }

      secondFields.push(...[
        {
          value: time.string(results.attempts[1].penaltySum),
        },
        {
          value: time.string(results.attempts[1].timeResult),
        },
      ]);

      fields.push(...[
        {
          value: time.string(results.attempts[0].penaltySum),
        },
        {
          value: time.string(results.attempts[0].timeResult),
        },
        {
          value: time.string(results.bestResult),
          rowSpan: 2,
        },
        {
          value: results.place,
          rowSpan: 2,
        },
        {
          value: results.points,
          rowSpan: 2,
        },
      ]);




      rows.push(fields);
      rows.push(secondFields);
    });

    return <div className="eventWrapper">
      <div className="categoryTitle">Слалом</div>
      <Table titleRow={{ cells: titleRow }} rows={rows.map(r => ({ cells: r }))} />
    </div>
  }
}
