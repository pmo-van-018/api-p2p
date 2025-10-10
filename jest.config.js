module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        "@base/(.*)$": "<rootDir>/src/$1",
        "@api/(.*)$": "<rootDir>/src/api/$1",
    },
    transform: {
        ".(ts|tsx)": "<rootDir>/test/preprocessor.js"
      },
    testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js",
      "json"
    ],
    setupFilesAfterEnv: [
      "./test/unit/lib/setup.ts",
    ],
    verbose: true,
    testTimeout: 30000
};
