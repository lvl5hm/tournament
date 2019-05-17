import React, { Component } from 'react';

let subscribers = [];

const defaultStore = {
  currentCategory: 0,
  currentEvent: 0,

  categories: [],
  teamUniqueId: 0,
  settings: {
    qualifiers: {
      checkpointCount: 4,
      maxPoints: 100,
      subtractPoints: 5,
    },
    sprint: {
      maxPoints: 200,
      subtractPoints: 10,
    },
    slalom: {
      checkpointCount: 10,
      maxPoints: 300,
      subtractPoints: 15,
    },
    longRace: {
      maxPoints: 400,
      subtractPoints: 20,
    },
    padWithZero: false,
  },
};
let store = Object.assign({}, defaultStore);
const storedItem = localStorage.getItem('store');
if (storedItem) {
  try {
    const obj = JSON.parse(storedItem);
    store = obj;
    if (!obj.categories) {
      store = defaultStore;
    }
  } catch (err) {

  }
}

store.update = (path, value) => {
  subscribers.forEach(s => s());
  localStorage.setItem('store', JSON.stringify(store));
}
store.subscribe = (s) => {
  subscribers.push(s);
}

store.setState = (state) => {
  Object.assign(store, state);
  store.update();
}
store.reset = () => {
  defaultStore.categories = [];
  Object.assign(store, defaultStore);
  store.update();
}

window.store = store;

export default store;

export const wrap = (Comp) => {
  return class Wrapper extends Component {
    constructor() {
      super();
      store.subscribe(() => this.forceUpdate());
    }

    render() {
      return <Comp />;
    }
  };
};
