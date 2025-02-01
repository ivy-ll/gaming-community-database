const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/gametable', async (req, res) => {
    const tableContent = await appService.fetchGames();
    res.json({data: tableContent});
});

router.get('/platformtable', async (req, res) => {
    const tableContent = await appService.fetchPlatforms();
    res.json({data: tableContent});
});

router.get('/studio-table', async (req, res) => {
    const tableContent = await appService.fetchStudios();
    res.json({ data: tableContent });
});

router.get('/creates-table', async (req, res) => {
    const tableContent = await appService.fetchCreates();
    res.json({ data: tableContent });
});

router.post("/initiate-gametable", async (req, res) => {
    const initiateResult = await appService.initiateGameTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-game-with-studio", async (req, res) => {
    const { game, studio } = req.body;

    try {
        const insertResult = await appService.insertGameWithStudio({
            gameID: game.gameID,
            gameTitle: game.gameTitle,
            crossplay: game.crossplay,
            studioID: studio.studioID,
            studioName: studio.studioName,
            country: studio.country,
            studioType: studio.studioType,
            yearFound: studio.yearFound,
        });
        if (insertResult.success) {
            res.json(insertResult);
        } else {
            res.status(400).json(insertResult);
        }
    } catch (error) {
        console.error("Error inserting game and studio:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.post("/update-game", async (req, res) => {
    const { gameID, updatedDetails } = req.body;
    const updateResult = await appService.updateGame(gameID, updatedDetails);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-game", async (req, res) => {
    const { gameID } = req.body;
    const deleteResult = await appService.deleteGame(gameID);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/join-game-platform', async (req, res) => {
    const { platformType } = req.body;
    const joinResult = await appService.joinGamePlatform(platformType);

    if (joinResult.length > 0) {
        res.json( joinResult);
    } else {
        res.status(500).json({ success: false});
    }
});

router.get('/group-by-games-per-studio', async (req, res) => {
    const results = await appService.groupByGamesPerStudio();
    res.json({ data: results });
});

router.get('/having-more-than-one-award', async (req, res) => {
    const results = await appService.gamesWithAwards();
    res.json({ data: results });
});

router.get('/count-games', async (req, res) => {
    const tableCount = await appService.countGames();
    if (tableCount >= 0) {
        res.json({
            success: true,
            count: tableCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: tableCount
        });
    }
});

// projection
router.post('/proj-filter-game-awards', async (req, res) => {
    const {selectedColumns} = req.body;
    const projectResult = await appService.projectGameAwards(selectedColumns);
    if (projectResult.success) {
        res.json({
            success: true,
            data: projectResult.data
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Projection failed",
            error: projectResult.error
        });
    }
});

// // selection
router.post('/select-filter-studio', async (req, res) => {
    const {filters} = req.body;
    const selectResult = await appService.selectStudio(filters);
    if (selectResult) {
        res.json({
            success: true,
            data: selectResult
        });
    } else {
        res.status(500).json({
            success: false,
            data: selectResult
        });
    }
});

// division
router.get('/divide-game-platforms', async(req,res) => {
    const results = await appService.getGamesAllPlatforms();
    res.json({ data: results });
});

// nested aggregation with group by
router.get('/get-studio-ratings', async(req,res) => {
    const result = await appService.topGameStudios();
    if (result) {
        res.json({
            success: true,
            data: result
        });
    } else {
        res.status(500).json({
            success: false,
            data: result
        });
    }
})

module.exports = router;