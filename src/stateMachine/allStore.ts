import createStore from "./store-core";
// import createReactBindings from "./store-react";

const store = createStore({
  count: 0,
  count2: 10,
  user: "Anon",
});

export { store };
