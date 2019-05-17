import React, { Component } from 'react';
import './App.css';
import Settings from '../Settings/Settings';
import QualifiersTable from '../Tables/QualifiersTable';
import SprintTable from '../Tables/SprintTable';
import LongRace from '../Tables/LongRace';
import SlalomTable from '../Tables/Slalom';
import TotalTable from '../Tables/TotalTable';
import Button from '../components/Button/Button';

import store, { wrap } from '../store';

const SHOW_SETTINGS = 0;
const SHOW_QUALIFIERS = 1;
const SHOW_SPRINT = 2;
const SHOW_SLALOM = 3;
const SHOW_LONG_RACE = 4;
const SHOW_RESULTS = 5;

class CategoryWrapper extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!store.currentCategory) {
      if (!store.categories.length) {
        return 'Добавьте хотя бы одну категорию';
      }
    }


    const category = store.categories[store.currentCategory];

    return <div className="allCategories">
      <div className="categorySelect">
        {store.categories.map((category, index) => {
          const disabled = category.teams.length < 2;

          return <Button
            className="categoryButton"
            disabled={disabled}
            selected={store.currentCategory === index}
            onClick={() => {
              store.currentCategory = index;
              store.update();
            }}
          >
            {category.title}
          </Button>
        })}
      </div>
      {store.categories.map((category, index) => {
        let table = null;

        if (category.teams.length < 2) {
          return null;
        }

        switch (this.props.show) {
          case SHOW_QUALIFIERS: table = <QualifiersTable teams={category.teams} />; break;
          case SHOW_SPRINT: table = <SprintTable teams={category.teams} />; break;
          case SHOW_SLALOM: table = <SlalomTable teams={category.teams} />; break;
          case SHOW_LONG_RACE: table = <LongRace teams={category.teams} />; break;
          case SHOW_RESULTS: table = <TotalTable teams={category.teams} />; break;
        }

        if (index === store.currentCategory) {
          return table;
        }
      })}
    </div>;
  }
}

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const atLeastOneCategory = store.categories.length > 0;

    return (
      <div className="App">
        <div className="menu">
          <Button
            selected={store.currentEvent === SHOW_SETTINGS}
            className="menuButton"
            onClick={() => { store.currentEvent = SHOW_SETTINGS; store.update(); }}
          >
            Настройки
          </Button>
          <Button
            selected={store.currentEvent === SHOW_QUALIFIERS}
            disabled={!atLeastOneCategory}
            className="menuButton"
            onClick={() => { store.currentEvent = SHOW_QUALIFIERS; store.update(); }}
          >
            Квалификация
          </Button>
          <Button
            selected={store.currentEvent === SHOW_SPRINT}
            disabled={!atLeastOneCategory}
            className="menuButton"
            onClick={() => { store.currentEvent = SHOW_SPRINT; store.update(); }}
          >
            H2H
          </Button >
          <Button
            selected={store.currentEvent === SHOW_SLALOM}
            disabled={!atLeastOneCategory}
            className="menuButton"
            onClick={() => { store.currentEvent = SHOW_SLALOM; store.update(); }}
          >
            Слалом
          </Button >
          <Button
            selected={store.currentEvent === SHOW_LONG_RACE}
            disabled={!atLeastOneCategory}
            className="menuButton"
            onClick={() => { store.currentEvent = SHOW_LONG_RACE; store.update(); }}
          >
            Длинная гонка
          </Button >
          <Button
            selected={store.currentEvent === SHOW_RESULTS}
            disabled={!atLeastOneCategory}
            className="menuButton"
            onClick={() => { store.currentEvent = SHOW_RESULTS; store.update(); }}
          >
            Итоги
          </Button >
        </div >
        {store.currentEvent === SHOW_SETTINGS ? <Settings /> : <CategoryWrapper show={store.currentEvent} />}
      </div >
    );
  }
}

export default wrap(App);
