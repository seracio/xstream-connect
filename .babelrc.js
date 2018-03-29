const { BABEL_ENV, NODE_ENV } = process.env;

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
    presets: presetsSandbox
};
