import {createStore} from "redux";
import {get} from "lodash/fp";

import leanReducer, {update} from "../lean";



test("update action creator", () => {
    const store = createStore(leanReducer);
    store.dispatch(update({foo: "bar"}));
    expect(get(["foo"], store.getState())).toBe("bar");
});

test("update action creator can use scope", () => {
    const store = createStore(leanReducer);
    store.dispatch(update(["sub"], {foo: "bar"}));
    expect(get(["sub", "foo"], store.getState())).toBe("bar");
});

test("do not expand lodash string paths", () => {
    const store = createStore(leanReducer);

    store.dispatch(update("no.way", {foo: "bar"}));
    expect(get(["no.way", "foo"], store.getState())).toBe("bar");
});