// Charger dotenv et snowflake
import dotenv from "dotenv";
import snowflake from "snowflake-sdk";

dotenv.config();

// Verification des variables d'environement
const requiredEnvVars = [
  "SNOWFLAKE_ACCOUNT",
  "SNOWFLAKE_USERNAME",
  "SNOWFLAKE_PASSWORD",
  "SNOWFLAKE_WAREHOUSE",
  "SNOWFLAKE_DATABASE",
  "SNOWFLAKE_SCHEMA",
];

try {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Variable d'environnement manquante: ${envVar}`);
    }
  }
} catch (error) {
  console.error("Configuration error:", error.message);
  throw error;
}

// Creer la connexion avec les variables d'environnement
let connection;
try {
  connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
  });
} catch (error) {
  console.error("Connection creation error:", error);
  throw error;
}

// Fonction de connexion avec Promise
const connectToSnowflake = () => {
  return new Promise((resolve, reject) => {
    console.log("Tentative de connexion a Snowflake...");
    connection.connect((err, conn) => {
      if (err) {
        console.error("Erreur de connexion à Snowflake :", err.message);
        reject(err);
      } else {
        console.log("Connexion reussie a Snowflake !");
        resolve(conn);
      }
    });
  });
};

// Fonction utilitaire pour exécuter des requêtes
const executeQuery = async (query, binds = []) => {
  if (!connection) {
    throw new Error("La connexion a Snowflake n'est pas initialise");
  }
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: query,
      binds: binds,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error("Erreur d'execution de la requete :", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      },
    });
  });
};

// Fonction pour fermer la connexion
const closeConnection = () => {
  if (!connection) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    connection.destroy((err) => {
      if (err) {
        console.error(
          "Erreur lors de la fermeture de la connexion :",
          err.message
        );
        reject(err);
      } else {
        console.log("Connexion fermee avec succes");
        resolve();
      }
    });
  });
};

export { connection, connectToSnowflake, executeQuery, closeConnection };
