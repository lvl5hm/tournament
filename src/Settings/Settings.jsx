import React, { Component } from 'react';
import './Settings.css';
import TextInput from '../components/TextInput/TextInput';
import Button from '../components/Button/Button';
import store from '../store';
import time from '../time';

const Team = ({ team, category }) => {
  return (<div className="team">
    <TextInput
      value={team.number}
      placeholder="Номер команды"
      onChange={v => { team.number = v; store.update() }}
    />
    <TextInput
      value={team.name}
      placeholder="Название команды"
      onChange={v => { team.name = v; store.update() }}
    />
    <TextInput
      value={team.subject}
      placeholder="Субъект команды"
      onChange={v => { team.subject = v; store.update() }}
    />
    <div className="heading">Состав команды</div>
    {team.members.map((m, i) => <div key={i} className="member">
      <TextInput
        value={m}
        placeholder="Имя участника"
        onChange={v => { team.members[i] = v; store.update() }}
      />
      <Button
        className="removeMemberButton"
        onClick={() => {
          team.members.splice(i, 1);
          store.update();
        }}
      >
        X
      </Button>
    </div>)}
    <div className="teamBottom">
      <Button
        className="addMemberButton"
        onClick={() => { team.members.push(''); store.update() }}
      >
        Добавить участника
      </Button>
      <Button
        className="removeTeamButton"
        onClick={() => {
          const teamIndex = category.teams.findIndex(t => t.id === team.id);
          category.teams.splice(teamIndex, 1);
          store.update()
        }}
      >
        Удалить команду
      </Button>
    </div>
  </div>);
}

const InputWithHint = ({ hint, value, onChange, bool }) => <div className="inputWithHint">
  <div className="hint">{hint}</div>
  <TextInput
    bool={bool}
    value={value}
    onChange={onChange}
  />
</div>;

const Category = ({ category }) => {
  return <div className="categoryWrapper">
    <div className="categoryTop">
      <TextInput
        className="categoryTitle"
        value={category.title}
        placeholder={'Название категории'}
        onChange={(v) => {
          category.title = v;
          store.update();
        }}
      />
      <Button
        className="removeCategoryButton"
        onClick={() => {
          const index = store.categories.findIndex(c => c.id === category.id);
          store.categories.splice(index, 1);
          store.update();
        }}
      >
        Удалить категорию
      </Button>
    </div>

    <div className="teamsWrapper">
      {category.teams.map((team, i) => <Team category={category} team={team} key={i} />)}
      <div className="addTeamWrapper">
        <Button
          className="addTeamButton"
          onClick={() => {
            category.teams.push({
              id: store.teamUniqueId++,
              number: '',
              name: '',
              subject: '',
              members: [],
              results: {
                qualifiers: {
                  startTime: time.zero(),
                  finishTime: time.zero(),
                  checkpoints: [],
                  points: 0,
                },
                sprint: {
                  parts: [],
                },
                slalom: {
                  attempts: [
                    {
                      checkpoints: [],
                    },
                    {
                      checkpoints: [],
                    },
                  ],
                },
                longRace: {},
              }
            });
            store.update();
          }}
        >
          Добавить команду
        </Button>
      </div>
    </div>
  </div>
};

export default class Settings extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="settings">

        <div className="saveBlock">
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store))}`}
            download="таблица_соревнований.json"
          >
            <Button className="downloadButton">
              Сохранить
            </Button>
          </a>

          <input
            id="file-input"
            type="file"
            name="name"
            style={{ display: 'none' }}
            onChange={(e) => {
              for (let file of e.target.files) {
                if (file.name.endsWith('.json')) {
                  const reader = new FileReader();
                  reader.onload = ((theFile) => {
                    return (e) => {
                      try {
                        const state = JSON.parse(e.target.result);
                        store.setState(state);
                      } catch (err) {
                        console.log(err);
                      }
                    };
                  })(file);

                  // Read in the image file as a data URL.
                  reader.readAsText(file);
                }
              }
            }}
          />

          <Button
            className="downloadButton"
            onClick={() => document.getElementById('file-input').click()}
          >
            Открыть
          </Button>

          <Button
            className="downloadButton clearButton"
            onClick={() => {
              const accept = window.confirm('Все данные будут удалены! Их можно сначала сохранить. Вы уверены?');
              if (accept) {
                localStorage.clear();
                store.reset();
              }
            }}
          >
            Очистить данные
          </Button>
        </div>




        <div className="section">
          <div className="sectionTitle">Квалификация</div>
          <InputWithHint
            hint="Количество чекпойнтов на квалификации"
            value={store.settings.qualifiers.checkpointCount}
            onChange={v => { store.settings.qualifiers.checkpointCount = v; store.update(); }}
          />
          <InputWithHint
            hint="Максимальное количество очков на квалификации"
            value={store.settings.qualifiers.maxPoints}
            onChange={v => { store.settings.qualifiers.maxPoints = v; store.update(); }}
          />
          <InputWithHint
            hint="Убывание очков на квалификации"
            value={store.settings.qualifiers.subtractPoints}
            onChange={v => { store.settings.qualifiers.subtractPoints = v; store.update(); }}
          />
        </div>


        <div className="section">
          <div className="sectionTitle">Спринт</div>
          <InputWithHint
            hint="Максимальное количество очков на спринте"
            value={store.settings.sprint.maxPoints}
            onChange={v => { store.settings.sprint.maxPoints = v; store.update(); }}
          />
          <InputWithHint
            hint="Убывание очков на спринте"
            value={store.settings.sprint.subtractPoints}
            onChange={v => { store.settings.sprint.subtractPoints = v; store.update(); }}
          />
        </div>


        <div className="section">
          <div className="sectionTitle">Слалом</div>
          <InputWithHint
            hint="Количество чекпойнтов на слаломе"
            value={store.settings.slalom.checkpointCount}
            onChange={v => { store.settings.slalom.checkpointCount = v; store.update(); }}
          />
          <InputWithHint
            hint="Максимальное количество очков на слаломе"
            value={store.settings.slalom.maxPoints}
            onChange={v => { store.settings.slalom.maxPoints = v; store.update(); }}
          />
          <InputWithHint
            hint="Убывание очков на слаломе"
            value={store.settings.slalom.subtractPoints}
            onChange={v => { store.settings.slalom.subtractPoints = v; store.update(); }}
          />
        </div>

        <div className="section">
          <div className="sectionTitle">Длинная гонка</div>
          <InputWithHint
            hint="Максимальное количество очков на длинной гонке"
            value={store.settings.longRace.maxPoints}
            onChange={v => { store.settings.longRace.maxPoints = v; store.update(); }}
          />
          <InputWithHint
            hint="Убывание очков на длинной гонке"
            value={store.settings.longRace.subtractPoints}
            onChange={v => { store.settings.longRace.subtractPoints = v; store.update(); }}
          />
        </div>

        <div className="section">
          <div className="sectionTitle">Другое</div>
          <InputWithHint
            bool
            hint="Добавлять нули к формату времени (00:00:000)"
            value={store.settings.padWithZero}
            onChange={v => { store.settings.padWithZero = v; store.update(); }}
          />
        </div>

        <div className="categoriesWrapper">
          {store.categories.map((category, i) => <Category category={category} key={i} />)}

          <Button
            className="addCategoryButton"
            onClick={() => {
              store.categories.push({
                title: '',
                teams: [],
                id: store.teamUniqueId++,
              });
              store.update();
            }}
          >
            Добавить категорию
          </Button>
        </div>
      </div>
    );
  }
};
