module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Scoped to src so the committed build output in dist/ is never collected as a test suite.
    testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFiles: ['jest-localstorage-mock'],
};
