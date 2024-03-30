--
-- MUSIC DATABASE
--

CREATE TABLE IF NOT EXISTS process (
  PRIMARY KEY (name),
  name        varchar(30)              NOT NULL,
              CONSTRAINT check_process_name CHECK (
                name = 'validation' OR 
                name = 'seeding'
              ),
  created_at  timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at  timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  status      char(7)                  DEFAULT NULL,
              CONSTRAINT check_process_status CHECK (
                status = 'pending' OR 
                status = 'success' OR
                status = 'failure'
              ),
  result      jsonb                    DEFAULT NULL   
);



CREATE TABLE IF NOT EXISTS track (
  PRIMARY KEY (track_id),
  track_id         integer          GENERATED ALWAYS AS IDENTITY,
  year             smallint         NOT NULL,
  title            varchar(200)     NOT NULL, 
                   CONSTRAINT check_track_title CHECK (title != ''),
  duration         numeric          NOT NULL,
  file_path        varchar(255)     NOT NULL,
                   CONSTRAINT unique_track_file_path UNIQUE (file_path),
  								 CONSTRAINT check_track_file_path CHECK (file_path != '')
);
CREATE INDEX track_title_idx ON track (lower(title) varchar_pattern_ops);
CREATE INDEX track_year_idx ON track(year);



CREATE TABLE IF NOT EXISTS artist (
  PRIMARY KEY (artist_id),
  artist_id       integer          GENERATED ALWAYS AS IDENTITY,
  name            varchar(200)     NOT NULL,
                  CONSTRAINT unique_artist_name UNIQUE (name),
  							  CONSTRAINT check_artist_name CHECK (name != '') 
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
  genre_id         integer          NOT NULL,
  name             varchar(200)     NOT NULL,
                   CONSTRAINT unique_genre_name UNIQUE (name),
  					       CONSTRAINT check_genre_name CHECK (name != '')
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