healthplatform-nodejs-rest-api
==============================
[![License](https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://travis-ci.org/offscale/healthplatform-nodejs-rest-api.svg?branch=master)](https://travis-ci.org/offscale/healthplatform-nodejs-rest-api)
[![Coverage Status](https://coveralls.io/repos/github/offscale/healthplatform-nodejs-rest-api/badge.svg)](https://coveralls.io/github/offscale/healthplatform-nodejs-rest-api)
![David dependency status for latest release](https://david-dm.org/offscale/healthplatform-nodejs-rest-api.svg)

System for doctors to triage patient images.

## Install prerequisites

### Node

  0. node & npm (tested with node v16.14.0 & npm v8.3.1)
  1. Run: `npm install -g typings typescript bunyan`
  2. `cd` to directory you've cloned this repo into
  3. Run: `typings install`
  4. Run: `npm install`

### External

  - Database, e.g.: Postgres. Set `RDBMS_URI` env var accordingly, e.g.: `postgres://username:password@hostname:port/database_name`. Modify [config.ts](https://github.com/offscale/healthplatform-nodejs-rest-api/blob/master/config.ts) to use a different database.
  - Redis. Set `REDIS_URL` env var accordingly; otherwise defaults are used.
  - Set: `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` env vars

## Docker

Alternatively there is a `Dockerfile` and `docker-compose.yml`, so rather than installing dependencies (other than [Docker](https://docs.docker.com/install/#supported-platforms)), you can run:

### Docker Compose

    docker-compose up

### Kubernetes
If you'd rather use Kubernetes to Docker Compose, then:
<TODO>

### Docker

If you don't want to use Docker Compose, then assuming you have Redis and Postgresql running independently of Docker, or exposed in Docker through ports, you can then run:

    docker run -e RDBMS_URI="$RDBMS_URI" \
               -e REDIS_HOST="$REDIS_HOST" \
               -e DEFAULT_ADMIN_EMAIL=foo \
               -e DEFAULT_ADMIN_PASSWORD=bar \
               -p 3000:3000 \
               --name "${PWD##*/}" \
               "${PWD##*/}_api"  # Name of the Docker image, the `_api` is suffixed by Docker Compose

Where `RDBMS_URI` and `REDIS_HOST` environment variables are set correctly for your system, in the form:

    export RDBMS_URI='postgres://username:password@hostname:port/database_name'
    export REDIS_HOST='host'

## Compile+run app

    tsc
    node main.js

## Misc

### Cleanup compiled output

When `*.js` isn't present in `.gitignore`, clean out compiled js with this GNU findutils & Bash solution:

    find -name '*.js.map' -type f -exec bash -c 'rm "${1}" "${1%????}"' bash {} \;

To delete all `*.js` outside of `node_modules`, use:

    find \( -name node_modules -prune \) -o -name '*.js' -type f -exec rm {} \;

More complicated solution handling "foo.ts" & "foo.js" without "foo.js.map" coming at some point.

---

## License

Licensed under any of:

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or <https://www.apache.org/licenses/LICENSE-2.0>)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or <https://opensource.org/licenses/MIT>)
- CC0 license ([LICENSE-CC0](LICENSE-CC0) or <https://creativecommons.org/publicdomain/zero/1.0/legalcode>)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
licensed as above, without any additional terms or conditions.
