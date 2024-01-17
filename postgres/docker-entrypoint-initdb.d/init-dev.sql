--
-- MUSIC DATABASE
--



CREATE TABLE IF NOT EXISTS subplaylist (
  PRIMARY KEY (subplaylist_id),
  subplaylist_id integer            GENERATED ALWAYS AS IDENTITY,
  name           varchar(100)       NOT NULL, 
                                    UNIQUE (name),
                                    CHECK (name != '')
);



CREATE TABLE IF NOT EXISTS playlist (
  PRIMARY KEY (playlist_id),
  playlist_id    integer            GENERATED ALWAYS AS IDENTITY,
  name           varchar(255)       NOT NULL,
                                    UNIQUE (name),
                                    CHECK (name != '')
);



CREATE TABLE IF NOT EXISTS year (
  PRIMARY KEY (year_id),
  year_id        integer            GENERATED ALWAYS AS IDENTITY,
  year           smallint           NOT NULL,
  								                  UNIQUE (year)
);
CREATE INDEX year_year_idx ON year (year);



CREATE TABLE IF NOT EXISTS track (
  PRIMARY KEY (track_id),
  track_id         integer          GENERATED ALWAYS AS IDENTITY,
  year_id          smallint         NOT NULL,
  title            varchar(200)     NOT NULL,
									                  CHECK (title != ''),
  duration         numeric          NOT NULL,
  file_path        varchar(255),    UNIQUE (file_path),
  								                  CHECK (file_path != ''),
                                  
  FOREIGN KEY (year_id) REFERENCES year (year_id)
    ON DELETE RESTRICT
);
CREATE INDEX track_title_idx ON track (lower(title) varchar_pattern_ops);



CREATE TABLE IF NOT EXISTS track_subplaylist (
  PRIMARY KEY (subplaylist_id, track_id),
  track_id       integer            NOT NULL,
  subplaylist_id integer            NOT NULL,

  FOREIGN KEY (track_id) REFERENCES track (track_id)
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
  FOREIGN KEY (subplaylist_id) REFERENCES subplaylist (subplaylist_id)
    ON UPDATE NO ACTION
    ON DELETE RESTRICT
);



CREATE TABLE IF NOT EXISTS track_playlist (
  PRIMARY KEY (track_id, playlist_id),
  track_id          integer            NOT NULL,
  playlist_id       integer            NOT NULL,

  FOREIGN KEY (track_id) REFERENCES track (track_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION,
  FOREIGN KEY (playlist_id) REFERENCES playlist (playlist_id)
    ON UPDATE NO ACTION
    ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS artist (
  PRIMARY KEY (artist_id),
  artist_id       integer          GENERATED ALWAYS AS IDENTITY,
  name            varchar(200)     NOT NULL,
  								                 UNIQUE (name),
  							                   CHECK (name != '')
);
CREATE INDEX artist_name_idx ON artist (name);



CREATE TABLE IF NOT EXISTS track_artist (
  PRIMARY KEY (track_id, artist_id),
  track_id        integer        NOT NULL,
  artist_id       integer        NOT NULL,

  FOREIGN KEY (track_id) REFERENCES track (track_id)
    ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
    ON DELETE RESTRICT
);



CREATE TABLE IF NOT EXISTS genre (
  PRIMARY KEY (genre_id),
  genre_id         integer          GENERATED ALWAYS AS IDENTITY,
  name             varchar(200)     NOT NULL,
  								                  UNIQUE (name),
  							                    CHECK (name != '')
);



CREATE TABLE IF NOT EXISTS track_genre (
  PRIMARY KEY (track_id, genre_id),
  track_id         integer        NOT NULL,
  genre_id         integer        NOT NULL,

  FOREIGN KEY (track_id) REFERENCES track (track_id)
    ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genre (genre_id)
    ON DELETE RESTRICT
);



--
-- USERS
--

CREATE TABLE IF NOT EXISTS appuser (
  PRIMARY KEY (appuser_id),
  appuser_id           integer        GENERATED ALWAYS AS IDENTITY,
  name                 varchar(50)    NOT NULL,
										                  CHECK (name != ''),
  settings             jsonb
);



--
-- VIEWS
--

CREATE VIEW view_stats AS
SELECT 
  track_count.count::integer AS tracks, 
  artist_count.count::integer AS artists,
  genre_count.count::integer AS genres
FROM 
  (SELECT COUNT(*) FROM track) AS track_count, 
  (SELECT COUNT(*) FROM artist) AS artist_count, 
  (SELECT COUNT(*) FROM genre) AS genre_count;


--

-- Comments in this query are relevant for all queries below. Most queries 
-- differ in only WHERE clause.
CREATE VIEW view_opener AS
WITH opener AS (
    -- Get all tracks matching our requirements
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2020 AND
      ge.name = 'Opener'  
    GROUP BY tr_ge.track_id, ye.year
)
-- The main query just joins, nothing else. We need it because otherwise, the 'genre' column contains only one value - the one mentioned in WHERE condition above - 'Opener'.
SELECT 
  tr.track_id, 
  opener.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN opener ON opener.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = opener.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, opener.year
ORDER BY random()
LIMIT 1;


CREATE VIEW view_dub AS
WITH dub AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2020 AND
      ge.name = 'Dub' AND
      ge.name != 'Opener' AND 
      ge.name != 'Closer'
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  dub.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN dub ON dub.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = dub.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, dub.year
ORDER BY random()
LIMIT 1;


CREATE VIEW view_beatless_ambient AS
WITH beatless_ambient AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2020 AND
      ge.name IN ('Beatless', 'Ambient') AND
      ge.name NOT IN ('Opener', 'Closer')
    GROUP BY tr_ge.track_id, ye.year HAVING COUNT(*) = 2
)
SELECT 
  tr.track_id, 
  beatless_ambient.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN beatless_ambient ON beatless_ambient.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = beatless_ambient.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, beatless_ambient.year
ORDER BY random()
LIMIT 1;


CREATE VIEW view_ambient_downtempo AS
WITH ambient_downtempo AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2020 AND
      ge.name IN ('Ambient', 'Downtempo', 'Trip-Hop') AND
      ge.name != 'Opener' AND 
      ge.name != 'Closer'
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  ambient_downtempo.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN ambient_downtempo ON ambient_downtempo.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = ambient_downtempo.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, ambient_downtempo.year
ORDER BY random()
LIMIT 4;



CREATE VIEW view_jungle_breakbeat AS
WITH jungle_breakbeat AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2020 AND
      ge.name IN ('Jungle', 'Breakbeat') AND
      ge.name != 'Opener' AND 
      ge.name != 'Closer'
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  jungle_breakbeat.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN jungle_breakbeat ON jungle_breakbeat.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = jungle_breakbeat.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, jungle_breakbeat.year
ORDER BY random()
LIMIT 1;



CREATE VIEW view_electro AS
WITH electro AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2020 AND
      ge.name = 'Electro' AND
      ge.name != 'Opener' AND 
      ge.name != 'Closer'
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  electro.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN electro ON electro.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = electro.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, electro.year
ORDER BY random()
LIMIT 1;



CREATE VIEW view_indie_soul_psyrock AS
WITH indie_soul_psyrock AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ge.name IN ('Indie', 'Soul', 'Psychedelic Rock') AND
      ge.name != 'Opener' AND 
      ge.name != 'Closer'
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  indie_soul_psyrock.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN indie_soul_psyrock ON indie_soul_psyrock.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = indie_soul_psyrock.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, indie_soul_psyrock.year
ORDER BY random()
LIMIT 1;



CREATE VIEW view_dance AS
WITH dance AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2020 AND 
      ge.name IN ('House', 'Acid House', 'Italo House', 'Techno', 'Trance', 'Psytrance') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' 
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  dance.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN dance ON dance.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = dance.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, dance.year
ORDER BY random()
LIMIT 1;



CREATE VIEW view_worldmusic AS
WITH worldmusic AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ge.name = 'World Music' AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' 
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  worldmusic.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN worldmusic ON worldmusic.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = worldmusic.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, worldmusic.year
ORDER BY random()
LIMIT 1;



CREATE VIEW view_anyold AS
WITH anyold AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
      ye.year >= 2004 AND 
      ge.name IN ('Ambient', 'Electro', 'Dub') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' 
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  anyold.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN anyold ON anyold.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = anyold.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, anyold.year
ORDER BY random()
LIMIT 1;



CREATE VIEW view_closer AS
WITH closer AS (
    SELECT tr_ge.track_id, ye.year FROM track_genre AS tr_ge 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track AS tr ON tr.track_id = tr_ge.track_id
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
    WHERE 
    ye.year >= 2020 AND 
    ge.name IN ('Closer', 'Vocal')
    GROUP BY tr_ge.track_id, ye.year
)
SELECT 
  tr.track_id, 
  closer.year,
  array_agg(DISTINCT ar.name) AS artist, 
  tr.title, 
  array_agg(DISTINCT ge.name) AS genre,
  duration,
  tr.file_path
FROM track AS tr
  INNER JOIN closer ON closer.track_id = tr.track_id
  INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = closer.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
  INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
  INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
GROUP BY tr.track_id, closer.year
ORDER BY random()
LIMIT 1;
