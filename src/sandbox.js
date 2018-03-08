// @flow
import React from 'react';

const StoreContext = React.createContext(null);

type PropsProvider = {
    store: { [key: string]: any },
    children: any
};

class Provider extends React.PureComponent<PropsProvider> {
    render() {
        <StoreContext.Provider value={this.props.store}>
            {this.props.children}
        </StoreContext.Provider>;
    }
}

const connect = combinator => WrappedComponent => {
    class Connect extends React.PureComponent<*> {}
};

console.log(StoreContext);
