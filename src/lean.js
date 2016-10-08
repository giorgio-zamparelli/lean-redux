
import {connect} from "react-redux";
import getOr from "lodash/fp/getOr";
import updateIn from "lodash/fp/update";
import mapValues from "lodash/fp/mapValues";
import updateObject from "updeep";
const mapValuesWithKey = mapValues.convert({cap: false});


const plain = {};
const pass = o => o;
const withSlash = s => s ? ("/" + s) : "";

export function thunk(cb) {
    return {_thunk: cb};
}

export function connectLean(options=plain) {

    const withDefaults = options.defaults ? s => ({...options.defaults, ...s}) : pass;

    var connector = connect(
        (fullState, ownProps) => {
            var scope = ownProps.scope || options.scope;

            if (!scope && typeof options.mapState !== "function") {
                console.warn("scope and mapState are undefined for connectLean. The component will render on every store update. You have killed performance.");
                return fullState;
            }

            const mapState = typeof options.mapState === "function" ? options.mapState : pass;
            var scopedState = getOr(plain, scope, fullState);

            return mapState(withDefaults(scopedState));
        },
        (dispatch, ownProps) => {

            const dispatchUpdate = (updateName, update) => {
                if (update && typeof update._thunk === "function") {
                    return update._thunk(dispatchUpdate.bind(null, updateName), options.updates);
                }
                var scope = ownProps.scope || options.scope;
                var actionSuffix = options.scope;
                if (Array.isArray(actionSuffix)) {
                    actionSuffix = actionSuffix.join(".");
                }

                dispatch({
                    type: "LEAN_UPDATE" + withSlash(actionSuffix) + withSlash(updateName),
                    update,
                    withDefaults,
                    scope,
                });
            };

            const bindDispatch = (updateFn, updateName) => (...args) => dispatchUpdate(updateName, updateFn(...args));

            return mapValuesWithKey(bindDispatch, options.updates);
        }
    );

    if (options.scope) {
        connector.displayName  = options.scope;
    }
    return connector;
}

const actionPattern = /^LEAN_UPDATE/;

export default function leanReducer(state, action) {
    if (!actionPattern.test(action.type)) {
        return state;
    }
    const {scope, update, withDefaults} = action;

    if (scope) {
        return updateIn(scope, s => updateObject(update, withDefaults(s)), state);
    }

    return updateObject(action.update, withDefaults(state));
}
