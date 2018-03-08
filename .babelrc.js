const { BABEL_ENV, NODE_ENV } = process.env;
const cjs = BABEL_ENV === 'cjs' || NODE_ENV === 'test';

const presetsSandbox = [
    '@babel/preset-flow',
    '@babel/preset-react',
    [
        '@babel/preset-env',
        {
            targets: {
                node: 'current'
            }
        }
    ]
];

const presetsProduction = [
    '@babel/preset-flow',
    '@babel/preset-react',
    [
        '@babel/preset-env',
        {
            targets: {
                browsers: ['last 2 versions', 'safari >= 7']
            },
            modules: false,
            forceAllTransforms: true
        }
    ]
];

module.exports = {
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread'
    ],
    presets: BABEL_ENV === 'sandbox' ? presetsSandbox : presetsProduction
};
