/* eslint-disable */
export default {
  displayName: 'deal-ticket',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/deal-ticket',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
