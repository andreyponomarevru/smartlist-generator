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

CREATE VIEW view_stats AS
SELECT 
  track_count.count::integer AS tracks, 
  artist_count.count::integer AS artists,
  genre_count.count::integer AS genres
FROM 
  (SELECT COUNT(*) FROM track) AS track_count, 
  (SELECT COUNT(*) FROM artist) AS artist_count, 
  (SELECT COUNT(*) FROM genre) AS genre_count;



CREATE VIEW view_playlist AS
WITH 
  opener AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist, 
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre 
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
    WHERE 
      ye.year >= 2020 AND 
      ge.name = 'Opener'
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  dub AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  beatless_ambient AS (
    SELECT
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist, 
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path HAVING COUNT(*) = 2 
    ORDER BY random()
    LIMIT 1
  ),

  ambient_or_downtempo AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 4
  ),

  jungle_or_breakbeat AS (
    SELECT
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr
      INNER JOIN year AS ye ON ye.year_id = tr.year_id
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  electro AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  indie_soul_rock AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  beat AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  world_music AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  any_old AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  ),

  closer AS (
    SELECT 
      tr.track_id, 
      array_agg(DISTINCT ar.name) AS artist,       
      tr.file_path, 
      tr.title, 
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr 
      INNER JOIN year AS ye ON ye.year_id = tr.year_id 
      INNER JOIN track_genre AS tr_ge ON tr_ge.track_id = tr.track_id 
      INNER JOIN genre  AS ge ON ge.genre_id = tr_ge.genre_id 
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
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
    GROUP BY tr.track_id, tr.file_path
    ORDER BY random()
    LIMIT 1
  )

SELECT 
  o.track_id AS "trackId", 
  o.artist, 
  o.title, 
  o.genre, 
  o.file_path AS "filePath"
FROM 
  opener AS o UNION

SELECT 
  d.track_id AS "trackId", 
  d.artist, 
  d.title, 
  d.genre, 
  d.file_path AS "filePath"
FROM 
  dub AS d UNION 

SELECT 
  b.track_id AS "trackId", 
  b.artist, 
  b.title, 
  b.genre, 
  b.file_path AS "filePath"
FROM 
  beatless_ambient AS b UNION

SELECT 
  a.track_id AS "trackId", 
  a.artist, 
  a.title, 
  a.genre, 
  a.file_path AS "filePath"
FROM 
  ambient_or_downtempo AS a UNION

SELECT 
  j.track_id AS "trackId", 
  j.artist, 
  j.title, 
  j.genre, 
  j.file_path AS "filePath"
FROM 
  jungle_or_breakbeat AS j UNION

SELECT 
  e.track_id AS "trackId", 
  e.artist, 
  e.title, 
  e.genre, 
  e.file_path AS "filePath"
FROM 
  electro AS e UNION 

SELECT 
  i.track_id AS "trackId", 
  i.artist, 
  i.title, 
  i.genre, 
  i.file_path AS "filePath"
FROM 
  indie_soul_rock AS i UNION

SELECT 
  be.track_id AS "trackId", 
  be.artist, 
  be.title, 
  be.genre, 
  be.file_path AS "filePath"
FROM 
  beat AS be UNION

SELECT 
  w.track_id AS "trackId", 
  w.artist,
  w.title, 
  w.genre, 
  w.file_path AS "filePath"
FROM 
  world_music AS w UNION 

SELECT 
  an.track_id AS "trackId", 
  an.artist, 
  an.title, 
  an.genre, 
  an.file_path AS "filePath"
FROM 
  any_old AS an UNION

SELECT 
  result.track_id AS "trackId", 
  result.artist, 
  result.title, 
  result.genre, 
  result.file_path AS "filePath"
FROM 
  closer AS result;