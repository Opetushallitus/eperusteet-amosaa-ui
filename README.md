# eperusteet-amosaa-lukio-ui

[![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-amosaa-lukio.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-amosaa-lukio)
[![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-amosaa-lukio/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-amosaa-lukio/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/Opetushallitus/eperusteet-amosaa-lukio/badge.svg)](https://snyk.io/test/github/Opetushallitus/eperusteet-amosaa-lukio)

## Projektin asentaminen

### Kehitysympäristön vaatimukset

```
Node.js 10 LTS
```

### Riippuvuuksien asentaminen

```sh

git submodule update --init --recursive
cd eperusteet-frontend-utils/vue && yarn install && yarn gen:api:amosaa && rm -rf node_modules && cd ..
yarn install

```

### Rajapintojen generoiminen

Aseta ympäristömuuttuja AMOSAA\_SERVICE\_DIR osoittamaan
[eperusteet-amosaa](https://github.com/Opetushallitus/eperusteet-amosaa)\/eperusteet-amosaa-service
hakemistoon.

```sh

# Generointi väliaikaisella apuskriptilla
yarn gen:api:amosaa

# Generointi ilman
mkdir -p src/generated
cd src/generated
openapi-generator generate -i <specfile> -g typescript-axios

```

### Kehitysympäristön käynnistäminen

```sh

yarn serve

```

### Tuotantoversion rakentaminen

```sh

yarn build

```

### Testaaminen

```sh

# Run all tests
yarn test

# Run unit tests only
yarn test:unit

# Run e2e tests
yarn test:e2e

# Edit e2e tests
yarn dev:e2e

```

### Lähdekoodin analysoiminen

```sh

yarn lint
yarn lint:fix
yarn test:unit:coverage

```

### Yksikkötestien ajaminen

```sh

yarn test:unit
yarn test:unit:dev # Pitää testit käynnissä

```

### Suositeltavat resurssit

- [Vue style guide](https://vuejs.org/v2/style-guide)

## ePerusteet-projektit

  Projekti | Build status | Maintainability | Test Coverage | Known Vulnerabilities
  -------- | ------------ | --------------- | ------------- | ----------------------
  [ePerusteet](https://github.com/Opetushallitus/eperusteet) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet)
  [ePerusteet-ui](https://github.com/Opetushallitus/eperusteet-ui) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ui.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ui)
  [ePerusteet-amosaa](https://github.com/Opetushallitus/eperusteet-amosaa) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-amosaa.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-amosaa)
  [ePerusteet-ylops](https://github.com/Opetushallitus/eperusteet-ylops) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops)
  [ePerusteet-ylops-lukio](https://github.com/Opetushallitus/eperusteet-ylops-lukio) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio) | [![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/test_coverage) | [![Known Vulnerabilities](https://snyk.io/test/github/Opetushallitus/eperusteet-ylops-lukio/badge.svg)](https://snyk.io/test/github/Opetushallitus/eperusteet-ylops-lukio)
  [ePerusteet-amosaa-ui](https://github.com/Opetushallitus/eperusteet-amosaa-ui) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-amosaa-ui.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops-lukio) | [![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-lukio/test_coverage) | [![Known Vulnerabilities](https://snyk.io/test/github/Opetushallitus/eperusteet-amosaa-ui/badge.svg)](https://snyk.io/test/github/Opetushallitus/eperusteet-amosaa-ui)
  [ePerusteet-opintopolku](https://github.com/Opetushallitus/eperusteet-opintopolku) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-opintopolku.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-opintopolku) | [![Maintainability](https://api.codeclimate.com/v1/badges/24fc0c3e2b968b432319/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-opintopolku/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/24fc0c3e2b968b432319/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-opintopolku/test_coverage)
  [ePerusteet-backend-utils](https://github.com/Opetushallitus/eperusteet-backend-utils) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-backend-utils.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-backend-utils)
  [ePerusteet-frontend-utils](https://github.com/Opetushallitus/eperusteet-frontend-utils) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-frontend-utils.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-frontend-utils) | [![Maintainability](https://api.codeclimate.com/v1/badges/f782a4a50622ae34a2bd/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-frontend-utils/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/f782a4a50622ae34a2bd/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-frontend-utils/test_coverage)
