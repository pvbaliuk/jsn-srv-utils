# @jsnw/srv-utils

Small server-side utility bundle for Node.js/TypeScript projects. It includes helpers for tsconfig path aliases, NestJS app bootstrapping, and YAML config loading with Zod validation plus a few predefined schemas.

## Install

```bash
npm install @jsnw/srv-utils
```

Optional dependencies:
- `@nestjs/core` and `@nestjs/common` for `withNest`

## Exports

### getRootPackageDirnameSync()
Finds the highest directory (from the current module) that still has a readable `package.json`.

```ts
import {getRootPackageDirnameSync} from '@jsnw/srv-utils';

const root = getRootPackageDirnameSync();
```

### ConfigLoader.loadConfig(path, schema, addProps?)
Loads a YAML file and validates it with a Zod schema. It also injects `isDev` based on `APP_CONTEXT`, `APPLICATION_CONTEXT`, or `NODE_ENV`.

**Path resolution prefixes:**
- `%pkgroot/` - Resolves to the project root directory
- `%env:VAR_NAME/` - Resolves based on environment variable value

```ts
import {ConfigLoader, configSchemas} from '@jsnw/srv-utils';

// Using project root
const config = ConfigLoader.loadConfig(
  '%pkgroot/config.yml',
  configSchemas.mongodbConnection
);

// Using environment variable
const config = ConfigLoader.loadConfig(
  '%env:CONFIG_PATH/config.yml',
  configSchemas.mongodbConnection
);
```

### configSchemas
Predefined Zod schemas:
- `timeString` (parses strings like `5s`, `2 min` into milliseconds)
- `connection` (host/port/user/pass)
- `mongodbConnection` (extends connection, adds db/authDb/connectTimeout + dsn)
- `mysqlConnection` (extends connection, adds dbname)
- `redisConnection` (extends connection, adds db/keyPrefix)

### withNest(moduleCls, fn)
Creates a NestJS application context, runs your function, then closes the app unless you call `preventClosing`.

```ts
import {withNest} from '@jsnw/srv-utils';
import {AppModule} from './app.module';

await withNest(AppModule, async (app, preventClosing) => {
  // use app.get(...) etc.
  // preventClosing(); // if you want to keep it open
});
```

## Types

`ResolvedConfig` is exported from `@jsnw/srv-utils` for typed config results.
