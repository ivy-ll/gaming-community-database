const oracledb = require('oracledb');
const loadEnvFile = require('../utils/envUtil');

const envVariables = loadEnvFile('../.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER.trim(),
    password: envVariables.ORACLE_PASS.trim(),
    connectString: `${envVariables.ORACLE_HOST.trim()}:${envVariables.ORACLE_PORT.trim()}/${envVariables.ORACLE_DBNAME.trim()}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// Fetch all games from the Game table
async function fetchGames() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Game`);
        return result.rows;
    }).catch((err) => {
        console.error("Fetch error:", err);
        return [];
    });
}

// Fetch all studios from game table
async function fetchStudios() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT studioID, studioName, studioType, country, yearFound FROM Studio`);
        return result.rows;
    }).catch((err) => {
        console.error("Fetch error:", err);
        return [];
    });
}

async function fetchCreates() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Creates`);
        return result.rows;
    }).catch((err) => {
        console.error("Fetch error:", err);
        return [];
    });
}

// Fetch all entries from Platform table
async function fetchPlatforms() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Platform`);
        return result.rows;
    }).catch((err) => {
        console.error("Fetch error:", err);
        return [];
    });
}

const fs = require('fs');
const path = require('path');

async function initiateGameTable() {
    return await withOracleDB(async (connection) => {
        try {
            const initSqlPath = path.resolve(__dirname, '../init.sql');
            const initSqlContent = fs.readFileSync(initSqlPath, 'utf8');
            // Split the SQL script into individual statements
            const sqlStatements = initSqlContent.split(';').map(stmt =>
                                          stmt.trim()).filter(stmt => stmt);
            console.log('Starting database reinitialization...');

            // Execute each SQL statement
            for (const sql of sqlStatements) {
                try {
                    await connection.execute(sql);
                } catch (err) {
                    console.error(`Error executing statement: ${sql}`);
                    console.error(err.message);
                }
            }
            await connection.commit();
            console.log('Database reinitialized successfully.');
            return true;
        } catch (err) {
            console.error('Error during database reinitialization:', err.message);
            return false;
        }
    });
}
// insert
async function insertGameWithStudio(data) {
    const { gameID, gameTitle, crossplay, studioID, studioName, country, studioType, yearFound } = data;
    return await withOracleDB(async (connection) => {
        try {
            // Validate Studio
            const studioNameCheck = await connection.execute(
                `SELECT studioID, country, studioType, yearFound 
                 FROM Studio WHERE LOWER(studioName) = LOWER(:studioName)`,
                { studioName }
            );
            if (studioNameCheck.rows.length > 0) {
                // Studio name exists; check if details match
                const [dbStudioID, dbCountry, dbStudioType, dbYearFound] = studioNameCheck.rows[0];
                const matches =
                    dbCountry.trim().toLowerCase() === country.trim().toLowerCase() &&
                    dbStudioType.trim().toLowerCase() === studioType.trim().toLowerCase() &&
                    parseInt(dbYearFound) === parseInt(yearFound);

                if (!matches) {
                    // Studio name exists but details don't match
                    return {
                        success: false,
                        message: `Studio Name "${studioName}" already exists.`
                    };
                } else {
                    console.log(`Studio Name "${studioName}" matches existing details. Proceeding.`);
                }
            } else {
                // Check if the Studio exists by ID
                const studioCheck = await connection.execute(
                    `SELECT studioName, country, studioType, yearFound 
                     FROM Studio WHERE studioID = :studioID`,
                    { studioID }
                );
                if (studioCheck.rows.length === 0) {
                    console.log(`Inserting Studio with ID: ${studioID}`);
                    await connection.execute(
                        `INSERT INTO Studio (studioID, studioName, country, studioType, yearFound)
                         VALUES (:studioID, :studioName, :country, :studioType, :yearFound)`,
                        { studioID, studioName, country, studioType, yearFound },
                        { autoCommit: false }
                    );
                } else {
                    // Studio ID exists; verify details
                    const [dbStudioName, dbCountry, dbStudioType, dbYearFound] = studioCheck.rows[0];
                    const matches =
                        dbStudioName.trim().toLowerCase() === studioName.trim().toLowerCase() &&
                        dbCountry.trim().toLowerCase() === country.trim().toLowerCase() &&
                        dbStudioType.trim().toLowerCase() === studioType.trim().toLowerCase() &&
                        parseInt(dbYearFound) === parseInt(yearFound);

                    if (!matches) {
                        return {
                            success: false,
                            message: `Studio ID ${studioID} already exists with different details.`
                        };
                    } else {
                        console.log(`Studio ID ${studioID} matches existing details. Proceeding.`);
                    }
                }
            }
            // Insert Game
            const gameCheckByID = await connection.execute(
                `SELECT COUNT(*) AS count FROM Game WHERE gameID = :gameID`,
                { gameID }
            );
            if (gameCheckByID.rows[0][0] > 0) {
                return { success: false, message: `Duplicate Game ID ${gameID}.` };
            }
            const gameCheckByTitle = await connection.execute(
                `SELECT COUNT(*) AS count FROM Game WHERE gameTitle = :gameTitle`,
                { gameTitle }
            );
            if (gameCheckByTitle.rows[0][0] > 0) {
                return { success: false, message: `Game Title "${gameTitle}" already exists.` };
            }
            console.log(`Inserting Game with ID: ${gameID}`);
            await connection.execute(
                `INSERT INTO Game (gameID, gameTitle, crossplay) 
                 VALUES (:gameID, :gameTitle, :crossplay)`,
                { gameID, gameTitle, crossplay },
                { autoCommit: false }
            );
            // Insert into Creates table
            console.log(`Inserting relationship between Game ID ${gameID} and Studio ID ${studioID}`);
            await connection.execute(
                `INSERT INTO Creates (gameID, studioID) 
                 VALUES (:gameID, :studioID)`,
                { gameID, studioID },
                { autoCommit: true }
            );
            return {
                success: true,
                message: "Game, Studio, and relationship inserted successfully."
            };
        } catch (err) {
            console.error("Insert error:", err.message);
            await connection.rollback();
            throw err;
        }
    });
}
// update
async function updateGame(gameID, updatedDetails) {
    return await withOracleDB(async (connection) => {
        let updateFields = [];
        let bindVariables = { gameID };

        // Dynamically add fields based on what's provided
        if (updatedDetails.gameTitle) {
            updateFields.push("gameTitle = :gameTitle");
            bindVariables.gameTitle = updatedDetails.gameTitle;
        }
        if (updatedDetails.crossplay) {
            updateFields.push("crossplay = :crossplay");
            bindVariables.crossplay = updatedDetails.crossplay;
        }

        // Ensure at least one field is being updated
        if (updateFields.length === 0) {
            throw new Error("No valid fields provided to update.");
        }

        const query = `UPDATE Game SET ${updateFields.join(", ")} WHERE gameID = :gameID`;

        const result = await connection.execute(query, bindVariables, { autoCommit: true });
        return result.rowsAffected > 0;
    }).catch((err) => {
        console.error("Update error:", err);
        return false;
    });
}
// delete
async function deleteGame(gameID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Game WHERE gameID = :gameID`,
            { gameID },
            { autoCommit: true }
        );
        return result.rowsAffected > 0;
    }).catch((err) => {
        console.error("Update error:", err);
        return false;
    });
}
// join
async function joinGamePlatform(platformType) {
    return await withOracleDB(async (connection) => {
        let query = `SELECT g.gameID, g.gameTitle, p.platformName, p.platformType, TO_CHAR(gop.releaseDate, 'YYYY-MM-DD') AS formattedReleaseDate,
                            CASE 
                                WHEN gop.priceCAD = 0 THEN '0.00'
                                ELSE TO_CHAR(gop.priceCAD, '999.99')
                            END AS formattedPriceCAD
                     FROM Game g, GameOnPlatform gop, Platform p
                     WHERE g.gameID = gop.gameID AND p.platformName = gop.platformName`

        // accounting for ALL selection option
        if (platformType !== 'all') {
            query += ` AND p.platformType = :platformType`;
        }

        const result = await connection.execute(
            query,
            platformType !== "all" ? { platformType } : {},
            { autoCommit: false }
        );

        return result.rows;

    }).catch((err) => {
        console.error("Error in finding games on platform!", err);
        return false;
    });
}
// Aggregation with GROUP BY
async function groupByGamesPerStudio() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT s.studioName, COUNT(c.gameID) AS gameCount
            FROM Studio s
                     LEFT JOIN Creates c ON s.studioID = c.studioID
            GROUP BY s.studioName
            ORDER BY gameCount DESC
        `;
        const result = await connection.execute(query);

        return result.rows;
    }).catch((err) => {
        console.error("Group By error:", err);
        return [];
    });
}

// Aggregation with HAVING
async function gamesWithAwards() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT g.gameTitle, COUNT(ae.awdTitle) AS awardCount
            FROM Game g, AwardEvent ae
            WHERE g.gameID = ae.gameID
            GROUP BY g.gameTitle
            HAVING COUNT(ae.awdTitle) > 0
            ORDER BY awardCount DESC
        `;

        const result = await connection.execute(query);
        return result.rows;
    }).catch((err) => {
        console.error("HAVING query error:", err);
        return [];
    });
}

async function countGames() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT COUNT(*) FROM Game');
        return result.rows[0][0];
    }).catch((err) => {
        console.error("Count error:", err);
        return -1;
    });

}

//project
async function projectGameAwards(columns) {
    return await withOracleDB(async (connection) => {
        const processedCols = columns.map(col => {
            if (['gameID', 'gameTitle'].includes(col)) {
                return `g.${col}`;
            } else if (['awdTitle', 'awdYear'].includes(col)) {
                return `ae.${col}`;
            } else if (['awdDescription'].includes(col)) {
                return `ai.${col}`;
            }
            return col;
        }).join(", ");

        const projectQuery = `SELECT ${processedCols}
                                      FROM Game g, AwardEvent ae, AwardInfo ai
                                      WHERE ae.gameID = g.gameID AND ai.awdTitle = ae.awdTitle
                                      ORDER BY ae.awdYear DESC`;

        const result = await connection.execute(projectQuery);
        return {
            success: true,
            data: result.rows.length>0? result.rows:[],
            error: null
        }
    }).catch((err) => {
        console.error("Projection error", err)
        return {
            success: false,
            data: [],
            error: err.message
        }
    });
}

// selection
async function selectStudio(requestData) {
    let selectionQuery = 'SELECT studioID, studioName, studioType, country, yearFound FROM Studio';
    const queryConditions = [];
    const queryParams = [];

    requestData.forEach((filter, index) => {
        const { attribute, value, comparisonOperator, logicalOperator } = filter;

        queryConditions.push(`${attribute} ${comparisonOperator} :param${index}`);
        queryParams.push(value);

        if (index < requestData.length - 1 && logicalOperator) {
            queryConditions.push(logicalOperator);
        }
    });
    if (queryConditions.length > 0) {
        selectionQuery += ' WHERE ' + queryConditions.join(' ');
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(selectionQuery, queryParams);
        return result.rows;
    }).catch((err) => {
        console.error("Error in selectionStudio", err)
        return false;
    });
}

// division
async function getGamesAllPlatforms() {
    return await withOracleDB(async(connection) => {

const query = ` SELECT g.gameTitle, LISTAGG(gp.platformName, ', ') WITHIN GROUP (ORDER BY gp.platformName) AS platforms, g.crossPlay
                        FROM Game g, GameOnPlatform gp
                        WHERE g.gameID = gp.gameID AND
                        NOT EXISTS (SELECT pt.platformType
                                    FROM Platform pt
                                    MINUS
                                    SELECT p.platformType
                                    FROM GameOnPlatform gp2, Platform p
                                    WHERE gp2.gameID = g.gameID AND gp2.platformName = p.platformName)
                        GROUP BY g.gameTitle, g.crossplay`
        const result = await connection.execute(query);
        return result.rows;

    }).catch((err) => {
        console.error("Division error", err);
        return false;
    })
}

//nested aggregation with group by
async function topGameStudios() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT st.studioName, st.studioType, st.country, st.yearFound, AVG(gr.ratingScore) AS AverageRating
             FROM Studio st, Creates cr, Game g, AvgRating gr
             WHERE st.studioID = cr.studioID AND cr.gameID = g.gameID AND g.gameID = gr.gameID
             GROUP BY st.studioName, st.studioType, st.country, st.yearFound
             HAVING AVG(gr.ratingScore) > (
                 SELECT AVG(gr2.ratingScore)
                 FROM AvgRating gr2)
             ORDER BY AverageRating DESC`
        );
        return result.rows;
    }).catch((err) => {
        console.error("nested aggregation with group by error", err)
        return false;
    });
}

module.exports = {
    testOracleConnection,
    fetchGames,
    fetchStudios,
    fetchCreates,
    fetchPlatforms,
    initiateGameTable,
    insertGameWithStudio,
    updateGame,
    deleteGame,
    joinGamePlatform,
    groupByGamesPerStudio,
    gamesWithAwards,
    countGames,
    projectGameAwards,
    selectStudio,
    getGamesAllPlatforms,
    topGameStudios
};