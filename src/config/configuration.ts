export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3000', 10)
    }
  });
  