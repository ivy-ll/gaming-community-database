-- drop all tables first
drop table Studio cascade constraints;
drop table Game cascade constraints;
drop table Creates cascade constraints;
drop table Genre cascade constraints;
drop table TaggedWith cascade constraints;
drop table AwardInfo cascade constraints;
drop table AwardEvent cascade constraints;
drop table Event cascade constraints;
drop table Organizer cascade constraints;
drop table Organize cascade constraints;
drop table Hosts cascade constraints;
drop table SiteDetails cascade constraints;
drop table SiteInfo cascade constraints;
drop table ConnectedTo cascade constraints;
drop table AvgRating cascade constraints;
drop table Platform cascade constraints;
drop table SystemRequirements cascade constraints;
drop table GameOnPlatform  cascade constraints;
drop table GamePlatformRequires cascade constraints;
drop table SeriesGame cascade constraints;
drop table Prequel cascade constraints;

-- create all tables
CREATE TABLE Studio(
    studioID 	INT PRIMARY KEY,
    country 	VARCHAR(30),
    studioType 	VARCHAR(30),
    studioName 	VARCHAR(30) UNIQUE NOT NULL,
    yearFound 	INT);

CREATE TABLE Game(
    gameID 	INT PRIMARY KEY,
    gameTitle 	VARCHAR(50) UNIQUE NOT NULL,
    crossplay 	CHAR(1) NOT NULL);

CREATE TABLE Creates(
	gameID 	INT,
	studioID 	INT,
	PRIMARY KEY (gameID, studioID),
	FOREIGN KEY (gameID) REFERENCES Game
ON DELETE CASCADE,
--ON UPDATE CASCADE,
	FOREIGN KEY (studioID) REFERENCES Studio
ON DELETE CASCADE
--ON UPDATE CASCADE
                    );

CREATE TABLE Genre(
	genreName VARCHAR(30) PRIMARY KEY);

CREATE TABLE TaggedWith(
    gameID 	INT,
    genreName 	VARCHAR(30),
    PRIMARY KEY (gameID, genreName),
    FOREIGN KEY (gameID) REFERENCES Game
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (genreName) REFERENCES Genre
        ON DELETE CASCADE
        --ON UPDATE CASCADE
 );

CREATE TABLE AwardInfo(
    awdTitle 		VARCHAR(100) PRIMARY KEY,
    awdDescription 	VARCHAR(1000));

CREATE TABLE AwardEvent(
    awdTitle 	VARCHAR(200),
    awdYear	INT,
    gameID 	INT,
    PRIMARY KEY (awdTitle, awdYear),
    FOREIGN KEY (gameID) REFERENCES Game
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (awdTitle) REFERENCES AwardInfo
        ON DELETE CASCADE
        --ON UPDATE CASCADE
);

CREATE TABLE Event(
    eventLocation	VARCHAR(200),
    eventDate		DATE,
    eventDescription	VARCHAR(200),
    eventName	 	VARCHAR(200),
    PRIMARY KEY (eventLocation, eventDate, eventName));

CREATE TABLE Organizer(
	orgEmail		VARCHAR(200) PRIMARY KEY,
	orgName		VARCHAR(200) NOT NULL,
	eventsHosted	INT);

CREATE TABLE Organize(
	orgEmail		VARCHAR(200),
	eventLocation	VARCHAR(200),
	eventDate		DATE,
	eventName		VARCHAR(200),
    PRIMARY KEY (orgEmail, eventLocation, eventDate, eventName),
    FOREIGN KEY (orgEmail) REFERENCES Organizer
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (eventLocation, eventDate,eventName) REFERENCES Event
        ON DELETE CASCADE
        --ON UPDATE CASCADE
);

CREATE TABLE Hosts(
	gameID		INT,
	eventLocation	VARCHAR(200),
	eventDate		DATE,
	eventName		VARCHAR(200),
    PRIMARY KEY (GameID, eventLocation, eventDate, eventName),
    FOREIGN KEY (GameID) REFERENCES Game
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (eventLocation, eventDate,eventName) REFERENCES Event
        ON DELETE CASCADE
        --ON UPDATE CASCADE
    );

CREATE TABLE SiteDetails(
    siteDescription	VARCHAR(200) PRIMARY KEY,
	siteType		VARCHAR(200));

CREATE TABLE SiteInfo(
	siteID			INT PRIMARY KEY,
	siteName		VARCHAR(200) NOT NULL,
    siteDescription	VARCHAR(200),
	url			VARCHAR(200) UNIQUE NOT NULL,
    FOREIGN KEY (siteDescription) REFERENCES SiteDetails
        ON DELETE CASCADE
        --ON UPDATE CASCADE
                     );

CREATE TABLE ConnectedTo(
	gameID	INT,
	siteID		INT,
    PRIMARY KEY (gameID, siteID),
    FOREIGN KEY (gameID) REFERENCES Game
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (siteID) REFERENCES SiteInfo
        ON DELETE CASCADE
        --ON UPDATE CASCADE
    );

CREATE TABLE AvgRating(
	gameID               	INT,
	ratingScore          	INT,
	ratingCategory	VARCHAR(200),
    PRIMARY KEY (gameID, ratingScore, ratingCategory),
    FOREIGN KEY (gameID) REFERENCES Game
        ON DELETE CASCADE
        --ON UPDATE CASCADE
                      );

CREATE TABLE Platform(
    platformName	VARCHAR(200) PRIMARY KEY,
    platformType		VARCHAR(200) NOT NULL,
    manufacturer		VARCHAR(200));

CREATE TABLE SystemRequirements(
    sysReqID      INT PRIMARY KEY,
    graphics        VARCHAR(200) NOT NULL,
    storage          VARCHAR(200),
    memory         VARCHAR(200),
    OS                 VARCHAR(200) NOT NULL,
    processor	VARCHAR(200));

CREATE TABLE GameOnPlatform(
    gameID                   INT,
    platformName         VARCHAR(200),
    priceCAD                NUMBER NOT NULL,
    releaseDate            DATE NOT NULL,
    PRIMARY KEY(gameID, platformName),
    FOREIGN KEY (gameID) REFERENCES Game
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (platformName) REFERENCES Platform
        ON DELETE CASCADE
        --ON UPDATE CASCADE
    );

CREATE TABLE GamePlatformRequires(
    gameID                   INT,
    platformName         VARCHAR(200),
    sysReqsID              INT,
    PRIMARY KEY (gameID, platformName),
    FOREIGN KEY (gameID) REFERENCES Game
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (platFormName) REFERENCES Platform
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (sysReqsID) REFERENCES SystemRequirements
        ON DELETE CASCADE
        --ON UPDATE CASCADE
);

CREATE TABLE SeriesGame(
    gameID		INT PRIMARY KEY,
    seriesName		VARCHAR(200) NOT NULL,
    seriesPos		INT,
    FOREIGN KEY (gameID) REFERENCES Game
        ON DELETE CASCADE
        --ON UPDATE CASCADE
    );

CREATE TABLE Prequel(
    preGameID		INT,
    seGameID		INT,
    PRIMARY KEY(preGameID, seGameID),
    FOREIGN KEY (preGameID) REFERENCES Game
        ON DELETE CASCADE,
        --ON UPDATE CASCADE,
    FOREIGN KEY (seGameID) REFERENCES Game
        ON DELETE CASCADE
        --ON UPDATE CASCADE
);

-- insert some tuples
INSERT INTO Studio
VALUES (1, 'Japan', 'First-Party Studio', 'Nintendo EPD',2015);

INSERT INTO Studio
VALUES (2, 'United States', 'First-Party Studio', 'Naughty Dog',1984);

INSERT INTO Studio
VALUES (3, 'United States', 'First-Party Studio', 'Santa Monica Studio',1999);

INSERT INTO Studio
VALUES (4, 'United States', 'Third-Party Studio', 'Ready at Dawn',2003);

INSERT INTO Studio
VALUES (5, 'United States', 'Third-Party Studio', 'Javaground',2001);

INSERT INTO Studio
VALUES (6, 'United States', 'AAA Studio', 'Rockstar Games',1998);

INSERT INTO Studio
VALUES (7, 'Poland', 'Independent Third-Party Studio', 'CD projekt',1994);

INSERT INTO Studio
VALUES (8, 'United States', 'AAA Studio', 'Riot Games', 2006);

INSERT INTO Studio
VALUES (9, 'United States', 'AAA Studio', 'Valve', 1996);

INSERT INTO Studio
VALUES (10, 'United States', 'AAA Studio', 'Epic Games', 1991);

INSERT INTO Studio
VALUES (11, 'Sweden', 'First-Party Studio', 'Mojang Studios', 2009);

INSERT INTO Game
VALUES (1, 'The Legend of Zelda: Breath of the Wild', 'N');

INSERT INTO Game
VALUES (2, 'The Last of Us Part II', 'N');

INSERT INTO Game
VALUES (3, 'God of War', 'N');

INSERT INTO Game
VALUES (4, 'Red Dead Redemption 2', 'N');

INSERT INTO Game
VALUES (5, 'The Witcher 3: Wild Hunt', 'N');

INSERT INTO Game
VALUES (6, 'Valorant', 'N');

INSERT INTO Game
VALUES (7, 'CSGO2', 'N');

INSERT INTO Game
VALUES (8, 'Fortnite', 'Y');

INSERT INTO Game
VALUES (9, 'CSGO', 'N');

INSERT INTO Game
VALUES (10, 'The Witcher 2: Assassins of Kings', 'N');

INSERT INTO Game
VALUES (11, 'Thronebreaker: The Witcher Tales', 'N');

INSERT INTO Game
VALUES (12, 'The Legend of Zelda: Tri Force Heroes', 'N');

INSERT INTO Game
VALUES (13, 'The Legend of Zelda: Tears of the Kingdom', 'N');

INSERT INTO Game
VALUES (14, 'The Last of Us', 'N');

INSERT INTO Game
VALUES (15, 'The Last of Us: Left Behind', 'N');

INSERT INTO Game
VALUES (16, 'Minecraft', 'Y');

INSERT INTO Creates
VALUES (1,1);

INSERT INTO Creates
VALUES (2,2);

INSERT INTO Creates
VALUES (3,3);

INSERT INTO Creates
VALUES (3,4);

INSERT INTO Creates
VALUES (3,5);

INSERT INTO Creates
VALUES (4,6);

INSERT INTO Creates
VALUES(5,7);

INSERT INTO Creates
VALUES(6,8);

INSERT INTO Creates
VALUES(7,9);

INSERT INTO Creates
VALUES(8,10);

INSERT INTO Creates
VALUES(9, 9);

INSERT INTO Creates
VALUES(10, 7);

INSERT INTO Creates
VALUES(11, 7);

INSERT INTO Creates
VALUES(12, 1);

INSERT INTO Creates
VALUES(13, 1);

INSERT INTO Creates
VALUES(14, 2);

INSERT INTO Creates
VALUES(15, 2);

INSERT INTO Creates
VALUES(16, 11);

INSERT INTO Genre
VALUES ('Action-adventure');

INSERT INTO Genre
VALUES ('Hack and Slash');

INSERT INTO Genre
VALUES ('Action role-playing');

INSERT INTO Genre
VALUES ('Shooter Game');

INSERT INTO Genre
VALUES ('Open World');

INSERT INTO Genre
VALUES ('Tactical Shooter');

INSERT INTO Genre
VALUES ('Team-based');

INSERT INTO Genre
VALUES ('Battle Royale');

INSERT INTO Genre
VALUES ('Sandbox');

INSERT INTO Genre
VALUES ('Survival');

INSERT INTO TaggedWith
VALUES (1, 'Action-adventure');

INSERT INTO TaggedWith
VALUES (2, 'Action-adventure');

INSERT INTO TaggedWith
VALUES (2, 'Shooter Game');

INSERT INTO TaggedWith
VALUES (3, 'Action-adventure');

INSERT INTO TaggedWith
VALUES (3, 'Hack and Slash');

INSERT INTO TaggedWith
VALUES (4, 'Action-adventure');

INSERT INTO TaggedWith
VALUES (4, 'Shooter Game');

INSERT INTO TaggedWith
VALUES (5, 'Action role-playing');

INSERT INTO TaggedWith
VALUES (5, 'Open World');

INSERT INTO TaggedWith
VALUES (6, 'Tactical Shooter');

INSERT INTO TaggedWith
VALUES (6, 'Shooter Game');

INSERT INTO TaggedWith
VALUES (6, 'Team-based');

INSERT INTO TaggedWith
VALUES (7, 'Tactical Shooter');

INSERT INTO TaggedWith
VALUES (7, 'Shooter Game');

INSERT INTO TaggedWith
VALUES (7,'Team-based');

INSERT INTO TaggedWith
VALUES (8, 'Shooter Game');

INSERT INTO TaggedWith
VALUES (8, 'Battle Royale');

INSERT INTO TaggedWith
VALUES (9, 'Tactical Shooter');

INSERT INTO TaggedWith
VALUES (9, 'Shooter Game');

INSERT INTO TaggedWith
VALUES (9,'Team-based');

INSERT INTO TaggedWith
VALUES (10, 'Action role-playing');

INSERT INTO TaggedWith
VALUES (11, 'Action role-playing');

INSERT INTO TaggedWith
VALUES (12, 'Action-adventure');

INSERT INTO TaggedWith
VALUES (13, 'Action-adventure');

INSERT INTO TaggedWith
VALUES (14, 'Shooter Game');

INSERT INTO TaggedWith
VALUES (15,'Shooter Game');

INSERT INTO TaggedWith
VALUES (16,'Sandbox');

INSERT INTO TaggedWith
VALUES (16,'Survival');

INSERT INTO AwardInfo
VALUES('The Game Award for Best Role Playing Game', 'This award honors a title, single-player or ' ||
                                                    'multiplayer, where an individual assumes the role of one or more ' ||
                                                    'characters and develops those characters in terms of abilities, ' ||
                                                    'statistics, and/or traits as the game progresses. Gameplay involves' ||
                                                    ' exploring, acquiring resources, solving puzzles, and interacting ' ||
                                                    'with player or non-player characters in the persistent world. ' ||
                                                    'Through the player"s actions, his/her" virtual characters ' ||
                                                    'statistics or traits demonstrably evolve throughout the game');

INSERT INTO AwardInfo
VALUES('The Game Award for Best Narrative', 'it recognizes the overall excellence of writing in a ' ||
                                            'game - including, but not limited to, story, plot construction, dialogue, ' ||
                                            'branching narratives, etc.');

INSERT INTO AwardInfo
VALUES('British Academy Games Award for Music', 'It is given to recognize "excellence in ' ||
                                                'composition for a game music score, through original music and/or ' ||
                                                'creative use of licensed track');

INSERT INTO AwardInfo
VALUES('The Game Award for Most Anticipated Game', 'Awarded to the most eagerly awaited upcoming ' ||
                                                   'game, based on public excitement and anticipation prior to its ' ||
                                                   'release');

INSERT INTO AwardInfo
VALUES('BAFTA Games Award for Animation', 'It is given in honor to "the highest level of ' ||
                                          'excellence in bringing a game to life," considering elements such as ' ||
                                          '"player control, non-player characters, ambient/environmental animation, ' ||
                                          'facial animation and cinematics');

INSERT INTO AwardInfo
VALUES('Esports Game of the Year', NULL);

INSERT INTO AwardEvent
VALUES('BAFTA Games Award for Animation', 2021, 2);

INSERT INTO AwardEvent
VALUES('The Game Award for Most Anticipated Game', 2021, 10);

INSERT INTO AwardEvent
VALUES('British Academy Games Award for Music', 2023, 4);

INSERT INTO AwardEvent
VALUES('BAFTA Games Award for Animation', 2011, 8);

INSERT INTO AwardEvent
VALUES('Esports Game of the Year', 2001, 8);

INSERT INTO AwardEvent
VALUES('BAFTA Games Award for Animation', 2015, 12);

INSERT INTO AwardEvent
VALUES('The Game Award for Best Role Playing Game', 2018, 13);

INSERT INTO AwardEvent
VALUES('The Game Award for Most Anticipated Game' , 2016, 1);

INSERT INTO AwardEvent
VALUES('British Academy Games Award for Music', 2019, 3);

INSERT INTO AwardEvent
VALUES('British Academy Games Award for Music', 2017, 2);

INSERT INTO AwardEvent
VALUES('The Game Award for Best Narrative', 2018, 4);

INSERT INTO AwardEvent
VALUES('The Game Award for Best Narrative', 2008, 2);

INSERT INTO AwardEvent
VALUES('The Game Award for Best Role Playing Game', 2015, 5);

INSERT INTO AwardEvent
VALUES('Esports Game of the Year', 2023, 6);

INSERT INTO Event
VALUES('Arizona, USA', TO_DATE('2023-04-04', 'YYYY-MM-DD'), 'God of War voice actors Panel at the Game on Expo', 'Game on Expo');

INSERT INTO Event
VALUES('Arizona, USA', TO_DATE('2017-08-11', 'YYYY-MM-DD'), 'Legend of Zelda: Breath of the Wild voice actors Panel at Game on Expo', 'Game on Expo');

INSERT INTO Event
VALUES('Monterrey, Mexico', TO_DATE('2024-09-10', 'YYYY-MM-DD'), 'The VCT ascension qualifier for the Americas League','VCT Ascension');

INSERT INTO Event
VALUES('Jakarta, Indonesia', TO_DATE('2024-09-29', 'YYYY-MM-DD'), 'The VCT ascension qualifier for the Pacific League','VCT Ascension');

INSERT INTO Event
VALUES('Berlin, Germany', TO_DATE('2024-07-28', 'YYYY-MM-DD'), 'The VCT ascension qualifier for the EMEA League','VCT Ascension');

INSERT INTO Event
VALUES('Washington, USA', TO_DATE('2024-09-29', 'YYYY-MM-DD'), 'NA qualifiers for Red Bull Home Ground','Red Bull Home Ground');

INSERT INTO Event
VALUES('BC, Canada', TO_DATE('2024-08-31', 'YYYY-MM-DD'), 'Yearly LAN hosted by UBC Esports Association', 'UBC LAN');

INSERT INTO Organizer
VALUES('info@gameonexpo.com', 'Game on Entertainment', 9);

INSERT INTO Organizer
VALUES('support@riotgames.com', 'Riot Games', 40);

INSERT INTO Organizer
VALUES('conferences.events@redbullracing.com', 'Red Bull', 5);

INSERT INTO Organizer
VALUES('help@nerdstreet.com', 'NerdStreet', 10);

INSERT INTO Organizer
VALUES('contact@ubcesports.ca', 'UBCEA', 15);

INSERT INTO Organize
VALUES('info@gameonexpo.com', 'Arizona, USA', TO_DATE('2023-04-04', 'YYYY-MM-DD'), 'Game on Expo');

INSERT INTO Organize
VALUES('info@gameonexpo.com', 'Arizona, USA', TO_DATE('2017-08-11', 'YYYY-MM-DD'), 'Game on Expo');

INSERT INTO Organize
VALUES('support@riotgames.com', 'Monterrey, Mexico', TO_DATE('2024-09-10', 'YYYY-MM-DD'), 'VCT Ascension');

INSERT INTO Organize
VALUES('support@riotgames.com', 'Jakarta, Indonesia', TO_DATE('2024-09-29', 'YYYY-MM-DD'), 'VCT Ascension');

INSERT INTO Organize
VALUES('support@riotgames.com', 'Berlin, Germany', TO_DATE('2024-07-28', 'YYYY-MM-DD'), 'VCT Ascension');

INSERT INTO Organize
VALUES('conferences.events@redbullracing.com', 'Washington, USA', TO_DATE('2024-09-29', 'YYYY-MM-DD'), 'Red Bull Home Ground');

INSERT INTO Organize
VALUES('contact@ubcesports.ca', 'BC, Canada', TO_DATE('2024-08-31', 'YYYY-MM-DD'), 'UBC LAN');

INSERT INTO Hosts
VALUES(3, 'Arizona, USA', TO_DATE('2023-04-04', 'YYYY-MM-DD'), 'Game on Expo');

INSERT INTO Hosts
VALUES(1, 'Arizona, USA', TO_DATE('2017-08-11', 'YYYY-MM-DD'), 'Game on Expo');

INSERT INTO Hosts
VALUES(6, 'Monterrey, Mexico', TO_DATE('2024-09-10', 'YYYY-MM-DD'), 'VCT Ascension');

INSERT INTO Hosts
VALUES(6, 'Jakarta, Indonesia', TO_DATE('2024-09-29', 'YYYY-MM-DD'), 'VCT Ascension');

INSERT INTO Hosts
VALUES(6, 'Berlin, Germany', TO_DATE('2024-07-28', 'YYYY-MM-DD'), 'VCT Ascension');

INSERT INTO Hosts
VALUES(6, 'Washington, USA', TO_DATE('2024-09-29', 'YYYY-MM-DD'), 'Red Bull Home Ground');

INSERT INTO Hosts
VALUES(6, 'BC, Canada', TO_DATE('2024-08-31', 'YYYY-MM-DD'), 'UBC LAN');

INSERT INTO SiteDetails
VALUES('A site providing all information on the game, including game lore, mechanics, characters, etc.', 'Wikipedia');

INSERT INTO SiteDetails
VALUES('A reddit-like site covering all related esports events that additionally allows users to make discussion threads and share news.', 'Esports Forum');

INSERT INTO SiteDetails
VALUES('A site with game statistics from all players across all regions, users are able to see their own account statistics or view others.', 'Stats Tracker');

INSERT INTO SiteDetails
VALUES('The official game website where you can purchase/download the game', 'Official Site');

INSERT INTO SiteDetails
VALUES('The subreddit for the game', 'Subreddit');

INSERT INTO SiteInfo
VALUES(1, 'Valorant Wiki', 'A site providing all information on the game, including game lore, mechanics, characters, etc.', 'https://valorant.fandom.com/wiki/VALORANT_Wiki');

INSERT INTO SiteInfo
VALUES(2, 'VLR', 'A reddit-like site covering all related esports events that additionally allows users to make discussion threads and share news.', 'https://www.vlr.gg/');

INSERT INTO SiteInfo
VALUES(3, 'HLTV', 'A reddit-like site covering all related esports events that additionally allows users to make discussion threads and share news.', 'https://www.hltv.org/');

INSERT INTO SiteInfo
VALUES(4, 'Player Stats Tracker', 'A site with game statistics from all players across all regions, users are able to see their own account statistics or view others.', 'https://tracker.gg');

INSERT INTO SiteInfo
VALUES(5, 'Official Valorant Site', 'The official game website where you can purchase/download the game', 'https://playvalorant.com/en-us/');

INSERT INTO SiteInfo
VALUES(6, 'Valorant Subreddit', 'The subreddit for the game', 'https://www.reddit.com/r/VALORANT/');

INSERT INTO ConnectedTo
VALUES(6, 1);

INSERT INTO ConnectedTo
VALUES(6, 2);

INSERT INTO ConnectedTo
VALUES(6, 4);

INSERT INTO ConnectedTo
VALUES(6, 5);

INSERT INTO ConnectedTo
VALUES(6, 6);

INSERT INTO ConnectedTo
VALUES(7, 3);

INSERT INTO ConnectedTo
VALUES(7, 4);

INSERT INTO ConnectedTo
VALUES(8, 4);

INSERT INTO AvgRating
VALUES(1, 7.5, 'Overall');

INSERT INTO AvgRating
VALUES(2, 8.5, 'Overall');

INSERT INTO AvgRating
VALUES(3, 9, 'Overall');

INSERT INTO AvgRating
VALUES(4, 9.5, 'Overall');

INSERT INTO AvgRating
VALUES(5, 10, 'Overall');

INSERT INTO AvgRating
VALUES(10, 9.8, 'Overall');

INSERT INTO AvgRating
VALUES(6, 8.7, 'Overall');

INSERT INTO AvgRating
VALUES(7, 8.5, 'Overall');

INSERT INTO AvgRating
VALUES(8, 9, 'Overall');

INSERT INTO AvgRating
VALUES(6, 8, 'Accessibility');

INSERT INTO AvgRating
VALUES(7, 7, 'Graphics');

INSERT INTO AvgRating
VALUES(8, 10, 'Player Activity');

INSERT INTO Platform
VALUES('Xbox Series S', 'Console', 'Microsoft');

INSERT INTO Platform
VALUES('Xbox One', 'Console', 'Microsoft');

INSERT INTO Platform
VALUES('PS4', 'Console', 'Microsoft');

INSERT INTO Platform
VALUES('PS5', 'Console', 'Microsoft');

INSERT INTO Platform
VALUES('PC', 'PC', NULL);

INSERT INTO Platform
VALUES('Nintendo 3DS', 'Home Console', 'Nintendo');

INSERT INTO Platform
VALUES('Nintendo Switch', 'Home Console', 'Nintendo');

INSERT INTO SystemRequirements
VALUES(1, 'AMD Radeon R5 200 or Intel HD 4000', '30GB', '4GB', 'Windows 7 64-bit', 'Intel Core 2 Duo E8400 or AMD Athlon 200GE');

INSERT INTO SystemRequirements
VALUES(2, 'Any video card with 256 MB of VRAM or higher', '15GB', '2GB', 'Windows XP', 'Intel Core 2 Duo E6600 or AMD Phenom X3 8750');

INSERT INTO SystemRequirements
VALUES(3, 'Intel HD 4000', '15GB', '4GB', 'Windows 7/8/10 64-bit or Mac OS X Sierra', 'Intel Core i3 2.4');

INSERT INTO SystemRequirements
VALUES(4, 'Video card must be 256 MB or more and should be a DirectX 9-compatible with support for Pixel Shader 3.0', '15GB', '2GB', 'Windows 7/Vista/XP', 'Intel Core 2 Duo E6600 or AMD Phenom X3 8750');

INSERT INTO SystemRequirements
VALUES(5, 'NVIDIA GTX 960 (4 GB) or AMD R9 290X (4 GB)', '70GB', '8GB', 'Windows 10 64-bit (version 1809)', ' Intel i5-2500K or AMD Ryzen 3 1200');

INSERT INTO GameOnPlatform
VALUES(1, 'Nintendo Switch', 79.99, TO_DATE('2017-03-03', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(2, 'PS4', 49.99, TO_DATE('2020-06-19', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(2, 'PS5', 64.99, TO_DATE('2024-01-19', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(3, 'PS4', 19.99, TO_DATE('2018-04-20', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(4, 'PS4', 19.79, TO_DATE('2018-10-26', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(4, 'PC', 59.99, TO_DATE('2015-05-18', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(5, 'PC', 59.99, TO_DATE('2020-06-02', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(5, 'Xbox One', 59.99, TO_DATE('2015-05-18', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(6, 'PC', 0, TO_DATE('2020-06-02', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(7, 'PC', 0, TO_DATE('2023-09-27', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(8, 'PC', 0, TO_DATE('2017-09-26', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(9, 'PC', 0, TO_DATE('2012-08-21', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(10, 'PC', 19.99, TO_DATE('2011-05-17', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(11, 'PC', 19.99, TO_DATE('2018-10-23', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(12, 'Nintendo 3DS', 47.00, TO_DATE('2017-09-26', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(13, 'Nintendo Switch', 99.98, TO_DATE('2023-05-12', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(14, 'PC', 59.99, TO_DATE('2013-06-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(15, 'PC', 14.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(15, 'PS4', 14.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(15, 'PS5', 14.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(15, 'Xbox One', 14.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(15, 'Nintendo 3DS', 14.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(15, 'Xbox Series S', 14.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(15, 'Nintendo Switch', 14.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(16, 'Nintendo Switch', 29.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(16, 'Xbox One', 29.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(16, 'PS4', 26.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(16, 'PS5', 26.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(16, 'PC', 29.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(16, 'Nintendo 3DS', 29.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GameOnPlatform
VALUES(16, 'Xbox Series S', 29.99, TO_DATE('2014-02-14', 'YYYY-MM-DD'));

INSERT INTO GamePlatformRequires
VALUES(6, 'PC', 1);

INSERT INTO GamePlatformRequires
VALUES(7, 'PC', 2);

INSERT INTO GamePlatformRequires
VALUES(8, 'PC', 3);

INSERT INTO GamePlatformRequires
VALUES(9, 'PC', 4);

INSERT INTO GamePlatformRequires
VALUES(3, 'PC', 5);

INSERT INTO SeriesGame
VALUES(1, 'Legend of Zelda', 17);

INSERT INTO SeriesGame
VALUES(12, 'Legend of Zelda', 16);

INSERT INTO SeriesGame
VALUES(13, 'Legend of Zelda', 18);

INSERT INTO SeriesGame
VALUES(2, 'Last of Us', 3);

INSERT INTO SeriesGame
VALUES(14, 'Last of Us', 2);

INSERT INTO SeriesGame
VALUES(15, 'Last of Us', 4);

INSERT INTO SeriesGame
VALUES(3, 'God of War', 9);

INSERT INTO SeriesGame
VALUES(4, 'The Witcher', 3);

INSERT INTO SeriesGame
VALUES(10, 'The Witcher', 2);

INSERT INTO SeriesGame
VALUES(11, 'The Witcher', 4);

INSERT INTO SeriesGame
VALUES(7, 'CSGO', 2);

INSERT INTO SeriesGame
VALUES(9, 'CSGO', 1);

INSERT INTO Prequel
VALUES(14, 15);

INSERT INTO Prequel
VALUES(12, 13);

INSERT INTO Prequel
VALUES(10, 11);
