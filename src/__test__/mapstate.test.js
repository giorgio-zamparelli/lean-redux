import React from "react";
import {createStore} from "redux";

import {render} from "./helpers";

import {leanReducer, connectLean, update} from "../lean";

test("can map state", () => {
    const store = createStore(leanReducer);

    const My = ({name}) => {
        return <div>Hello {name}</div>;
    };

    const Connected = connectLean({
        defaultProps: {
            name: "default",
        },
        mapState(state) {
            return {name: state.name.toUpperCase()};
        },
    })(My);


    const component = render(store, Connected);
    expect(component.toJSON()).toMatchSnapshot();
    store.dispatch(update({name: "updated"}));
    expect(component.toJSON()).toMatchSnapshot();
});

test("map state can access ownProps", () => {
    const store = createStore(leanReducer);

    const My = ({name}) => {
        return <div>Hello {name}</div>;
    };

    const spy = jest.fn();

    const Connected = connectLean({
        defaultProps: {
            name: "default",
        },
        mapState(state, ownProps) {
            spy(ownProps.parentProp);
            return {name: state.name.toUpperCase()};
        },
    })(My);

    render(store, () => <Connected parentProp="parentValue" />);
    expect(spy).toHaveBeenCalledWith("parentValue");

});

// XXX
test.skip("do not execute mapState on ownProps changes if mapState does not use it", () => {
    const store = createStore(leanReducer);
    const mapSpy = jest.fn();
    const renderSpy = jest.fn();

    const My = ({name}) => {
        renderSpy();
        return <div>Hello {name}</div>;
    };

    const Connected = connectLean({
        defaultProps: {
            name: "default",
        },
        mapState(state) {
            mapSpy();
            return {name: state.name.toUpperCase()};
        },
    })(My);

    var setState = null;
    var Parent = React.createClass({
        getInitialState() {
            return {parentProp: "parentValue1"};
        },
        render() {
            // eslint-disable-next-line react/jsx-no-bind
            setState = this.setState.bind(this);

            return <Connected parentProp={this.state.parentProp} />;
        },
    });


    render(store, Parent);

    setState({parentProp: "parentValue2"});

    expect(renderSpy).toHaveBeenCalledTimes(3);
    expect(mapSpy).toHaveBeenCalledTimes(1);

});
