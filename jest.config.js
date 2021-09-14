module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  coverageReporters: [
    'text-summary',
    'json',
    'lcov',
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(ts|tsx|vue)',
    '!<rootDir>/src/api/*.ts',
    '!<rootDir>/src/**/script.ts',
    '!<rootDir>/**/*.d.ts',
    '!<rootDir>/eperusteet-frontend-utils/**',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/registerServiceWorker.ts',
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest',
  },
  'transformIgnorePatterns': [
    '/node_modules/(?!(@ckeditor|katex|vue-masonry|lodash-es|bootstrap-vue|vuelidate-property-decorators|deepdash-es)/)',
  ],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/eperusteet-frontend-utils/vue/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  snapshotSerializers: [
    'jest-serializer-vue',
  ],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
  ],
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
};
