--
-- MUSIC DATABASE
--

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
  is_excluded      boolean          DEFAULT false,
                                  
  FOREIGN KEY (year_id) REFERENCES year (year_id)
    ON DELETE RESTRICT
);
CREATE INDEX track_title_idx ON track (lower(title) varchar_pattern_ops);



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

CREATE VIEW view_track AS
SELECT 
  tr.track_id,
  ye.year, 
  json_agg(DISTINCT ar.name), 
  tr.title, 
  tr.duration, 
  tr.file_path AS "filePath", 
  json_agg(DISTINCT ar.artist_id) AS "artist_id", 
  json_agg(DISTINCT ge.genre_id)  AS "genre_id"
FROM track AS tr 
  INNER JOIN year AS ye ON tr.year_id = ye.year_id
  INNER JOIN track_artist AS tr_ar ON tr.track_id = tr_ar.track_id 
  INNER JOIN artist AS ar ON tr_ar.artist_id = ar.artist_id
  INNER JOIN track_genre AS tr_ge ON tr.track_id = tr_ge.track_id
  INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id

-- WHERE genre_id = tr.is_excluded = false

GROUP BY tr.track_id, ye.year, ar.name, tr.title, tr.duration, tr.file_path;



/*
CREATE VIEW view_stats AS
SELECT 
	release_count.count::integer AS releases,
  track_count.count::integer AS tracks, 
  artist_count.count::integer AS artists,
  label_count.count::integer AS labels,
  genre_count.count::integer AS genres
FROM 
	(SELECT COUNT(*) FROM release) AS release_count,
  (SELECT COUNT(*) FROM track) AS track_count, 
  (SELECT COUNT(*) FROM artist WHERE artist.name != 'Various') AS artist_count, 
  (SELECT COUNT(*) FROM label) AS label_count,
  (SELECT COUNT(*) FROM genre) AS genre_count;
  */







/* Already copied to code, left here in case you will need to retest it */

WITH 
  opener AS (
    SELECT tr.track_id, tr.file_path, array_agg(ge.name) FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
    WHERE 
      ye.year >= 2020 AND 
      ge.name = 'Opener'
    ORDER BY random()
    LIMIT 1
  ),

  dub AS (
    SELECT tr.track_id, tr.file_path FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
    WHERE
      ye.year >= 2020 AND
      ge.name = 'Dub' AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND
      NOT EXISTS (
        SELECT 
          previous_cte.track_id 
        FROM 
          opener AS previous_cte
        WHERE 
          tr.track_id = previous_cte.track_id 
      )
    ORDER BY random()
    LIMIT 1
  ),

  beatless_ambient AS (
    SELECT
      tr.track_id, tr.file_path
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id
    WHERE
      ye.year >= 2020 AND
      ge.name IN ('Beatless', 'Ambient') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND
      NOT EXISTS (
        SELECT 
          previous_cte1.track_id, 
          previous_cte2.track_id 
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2 
        WHERE 
          tr.track_id IN (
            previous_cte1.track_id, 
            previous_cte2.track_id
          )
      )
    GROUP BY tr.track_id HAVING COUNT(*) = 2
    ORDER BY random()
    LIMIT 1
  ),

  ambient_or_downtempo AS (
    SELECT 
      tr.track_id, tr.file_path
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE
      ye.year >= 2020 AND
      ge.name IN ('Ambient', 'Downtempo', 'Trip-Hop') AND 
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND
      NOT EXISTS (
        SELECT 
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3
        WHERE tr.track_id IN (
          previous_cte1.track_id, 
          previous_cte2.track_id,
          previous_cte3.track_id
        )
      )
    ORDER BY random()
    LIMIT 4
  ),

  jungle_or_breakbeat AS (
    SELECT
      tr.track_id, tr.file_path
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE 
      ye.year >= 2020 AND
      (ge.name = 'Jungle' OR ge.name = 'Breakbeat') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND
      NOT EXISTS (
        SELECT 
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id,
          previous_cte4.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3, 
          ambient_or_downtempo AS previous_cte4
        WHERE 
          tr.track_id IN (
            previous_cte1.track_id, 
            previous_cte2.track_id, 
            previous_cte3.track_id, 
            previous_cte4.track_id
          )
      )
    ORDER BY random()
    LIMIT 1
  ),

  electro AS (
    SELECT 
      tr.track_id, tr.file_path 
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE 
      ye.year >= 2020 AND
      ge.name = 'Electro' AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND
      NOT EXISTS (
        SELECT 
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id,
          previous_cte4.track_id,
          previous_cte5.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3, 
          ambient_or_downtempo AS previous_cte4, 
          jungle_or_breakbeat AS previous_cte5 
        WHERE 
          tr.track_id IN (
            previous_cte1.track_id, 
            previous_cte2.track_id, 
            previous_cte3.track_id, 
            previous_cte4.track_id,
            previous_cte5.track_id
          )
      )
    ORDER BY random()
    LIMIT 1
  ),

  indie_soul_rock AS (
    SELECT 
      tr.track_id, tr.file_path 
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE
      ge.name IN ('Indie', 'Soul', 'Psychedelic Rock') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND
      NOT EXISTS (
        SELECT 
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id,
          previous_cte4.track_id,
          previous_cte5.track_id,
          previous_cte6.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3, 
          ambient_or_downtempo AS previous_cte4, 
          jungle_or_breakbeat AS previous_cte5, 
          electro AS previous_cte6 
        WHERE 
          tr.track_id IN (
            previous_cte1.track_id,
            previous_cte2.track_id,
            previous_cte3.track_id,
            previous_cte4.track_id,
            previous_cte5.track_id,
            previous_cte6.track_id
          )
      )
    ORDER BY random()
    LIMIT 1
  ),

  beat AS (
    SELECT 
      tr.track_id, tr.file_path 
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE 
      ye.year >= 2020 AND 
      ge.name IN ('House', 'Acid House', 'Italo House', 'Techno', 'Trance') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND
      NOT EXISTS (
        SELECT
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id,
          previous_cte4.track_id,
          previous_cte5.track_id,
          previous_cte6.track_id,
          previous_cte7.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3, 
          ambient_or_downtempo AS previous_cte4, 
          jungle_or_breakbeat AS previous_cte5, 
          electro AS previous_cte6,
          indie_soul_rock AS previous_cte7
        WHERE
          tr.track_id IN (
            previous_cte1.track_id,
            previous_cte2.track_id,
            previous_cte3.track_id,
            previous_cte4.track_id,
            previous_cte5.track_id,
            previous_cte6.track_id,
            previous_cte7.track_id
          )
      )
    ORDER BY random()
    LIMIT 1
  ),

  world_music AS (
    SELECT 
      tr.track_id, tr.file_path 
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE 
      ge.name = 'World Music' AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND 
      NOT EXISTS (
        SELECT
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id,
          previous_cte4.track_id,
          previous_cte5.track_id,
          previous_cte6.track_id,
          previous_cte7.track_id,
          previous_cte8.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3, 
          ambient_or_downtempo AS previous_cte4, 
          jungle_or_breakbeat AS previous_cte5, 
          electro AS previous_cte6,
          indie_soul_rock AS previous_cte7,
          beat AS previous_cte8 
        WHERE 
          tr.track_id IN (
            previous_cte1.track_id,
            previous_cte2.track_id,
            previous_cte3.track_id,
            previous_cte4.track_id,
            previous_cte5.track_id,
            previous_cte6.track_id,
            previous_cte7.track_id,
            previous_cte8.track_id
          )
      )
    ORDER BY random()
    LIMIT 1
  ),

  any_old AS (
    SELECT 
      tr.track_id, tr.file_path 
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE 
      ye.year >= 2004 AND 
      ge.name IN ('Acid House', 'Ambient', 'Techno', 'Electro', 'Dub') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND 
      NOT EXISTS (
        SELECT 
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id,
          previous_cte4.track_id,
          previous_cte5.track_id,
          previous_cte6.track_id,
          previous_cte7.track_id,
          previous_cte8.track_id,
          previous_cte9.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3, 
          ambient_or_downtempo AS previous_cte4, 
          jungle_or_breakbeat AS previous_cte5, 
          electro AS previous_cte6,
          indie_soul_rock AS previous_cte7,
          beat AS previous_cte8,
          world_music AS previous_cte9
        WHERE 
          tr.track_id IN (
            previous_cte1.track_id,
            previous_cte2.track_id,
            previous_cte3.track_id,
            previous_cte4.track_id,
            previous_cte5.track_id,
            previous_cte6.track_id,
            previous_cte7.track_id,
            previous_cte8.track_id,
            previous_cte9.track_id
          )
      )
    ORDER BY random()
    LIMIT 1
  ),

  closer AS (
    SELECT 
      tr.track_id, tr.file_path
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
    WHERE 
      ye.year >= 2020 AND 
      ge.name IN ('Closer', 'Vocal') AND
      ge.name != 'Opener' AND
      ge.name != 'Closer' AND 
      NOT EXISTS (
        SELECT 
          previous_cte1.track_id,
          previous_cte2.track_id,
          previous_cte3.track_id,
          previous_cte4.track_id,
          previous_cte5.track_id,
          previous_cte6.track_id,
          previous_cte7.track_id,
          previous_cte8.track_id,
          previous_cte9.track_id,
          previous_cte10.track_id
        FROM 
          opener AS previous_cte1, 
          dub AS previous_cte2, 
          beatless_ambient AS previous_cte3, 
          ambient_or_downtempo AS previous_cte4, 
          jungle_or_breakbeat AS previous_cte5, 
          electro AS previous_cte6,
          indie_soul_rock AS previous_cte7,
          beat AS previous_cte8,
          world_music AS previous_cte9,
          any_old AS previous_cte10
        WHERE
          tr.track_id IN (
            previous_cte1.track_id,
            previous_cte2.track_id,
            previous_cte3.track_id,
            previous_cte4.track_id,
            previous_cte5.track_id,
            previous_cte6.track_id,
            previous_cte7.track_id,
            previous_cte8.track_id,
            previous_cte9.track_id,
            previous_cte10.track_id
          )
      )
    ORDER BY random()
    LIMIT 1
  )
SELECT track_id AS "tr.trackId", file_path FROM opener UNION
SELECT track_id AS "tr.trackId", file_path FROM dub UNION 
SELECT track_id AS "tr.trackId", file_path FROM beatless_ambient UNION
SELECT track_id AS "tr.trackId", file_path FROM ambient_or_downtempo UNION
SELECT track_id AS "tr.trackId", file_path FROM jungle_or_breakbeat UNION
SELECT track_id AS "tr.trackId", file_path FROM electro UNION 
SELECT track_id AS "tr.trackId", file_path FROM indie_soul_rock UNION
SELECT track_id AS "tr.trackId", file_path FROM beat UNION
SELECT track_id AS "tr.trackId", file_path FROM world_music UNION 
SELECT track_id AS "tr.trackId", file_path FROM any_old UNION
SELECT track_id AS "tr.trackId", file_path FROM closer;
