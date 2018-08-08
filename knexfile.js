require('dotenv').config()

const { DEV_DB_FN, PROD_DB_FN } = process.env

module.exports = {
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    migrations: {
      directory: `${__dirname}/node_modules/bfx-hf-db/migrations`,
    },
    connection: {
      filename: DEV_DB_FN
    }
  },

  production: {
    client: 'sqlite3',
    useNullAsDefault: true,
    migrations: {
      directory: `${__dirname}/node_modules/bfx-hf-db/migrations`,
    },
    connection: {
      filename: PROD_DB_FN
    }
  }
}
