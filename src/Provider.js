// @flow
import React, { PureComponent } from 'react';
import StoreContext from './StoreContext';

type Props = {
    store: { [key: string]: Function },
    children: any
};

class Provider extends PureComponent<Props> {
    render() {
        return (
            <StoreContext.Provider value={this.props.store}>
                {this.props.children}
            </StoreContext.Provider>
        );
    }
}

export default Provider;
