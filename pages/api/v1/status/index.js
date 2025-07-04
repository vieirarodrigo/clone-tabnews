import database from "infra/database.js";

async function status(request, response) {
  //const updateAt = Date.now();
  const updateAt = new Date().toISOString();

  //const databaseVersionResult = await database.query("SELECT version();");
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  //const databaseOpenedConnectionsResult = await database.query(
  //  "SELECT * from pg_stat_activity WHERE datname = 'local_db';",
  //);
  //const databaseName = "local_db";
  //const databaseName = request.query.databaseName;
  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query(
    //"SELECT count(*)::int frolocal_dbm pg_stat_activity WHERE datname = 'local_db';",
    //"SELECT count(*)::int from pg_stat_activity WHERE datname = '" + databaseName + "';",
    //`SELECT count(*)::int from pg_stat_activity WHERE datname = '${databaseName}';`,
    {
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    },
  );
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  response.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      },
    },
  });
}

export default status;
