// @flow
import React, { createContext, PureComponent } from 'react';

const StoreContext = createContext({});

type Props = {
    store: { [key: string]: Function },
    waitFor: Array<string>,
    children: any
};

class Provider extends PureComponent<Props> {
    constructor(props, context) {
        super(props, context);
        this.store = props.store;
    }

    render() {
        return (
            <StoreContext.Provider>
                {React.Children.only(this.props.children)}
            </StoreContext.Provider>
        );
    }
}

export default Provider;
