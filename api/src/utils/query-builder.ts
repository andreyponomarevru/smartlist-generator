export type Filter = { name: string; rule: string; value: number | number[] };

export type SearchParams = {
  operator: string;
  filters: { operator: string; filters: Filter[] }[] | Filter[];
  excludeTracks: number[];
};

function parseFilter({ name, rule, value }: Filter) {
  switch (name) {
    case "year": {
      switch (rule) {
        case "is":
          return `track.year = ${value}`;
        case "is not":
          return `track.year != ${value}`;
        case "greater than or equal":
          return `track.year >= ${value}`;
        case "less than or equal":
          return `track.year <= ${value}`;
        default:
          throw new Error(`Unknown rule ${rule}`);
      }
    }
    case "genre": {
      if (!Array.isArray(value)) {
        throw new Error(`Unknown value ${value}. Should be an array.`);
      }
      switch (rule) {
        case "contains any": {
          return `track_genre.genre_id IN (${value.join(", ")})`;
        }
        case "contains all": {
          // Select all records having genre_ids listed in filter.value.
          // The track should have ALL of the listed genre_ids.
          return `\
                track_genre.track_id IN ( 
                  SELECT track_genre.track_id
                  FROM track_genre 
                  WHERE track_genre.genre_id IN (${value.join(", ")}) 
                  GROUP BY track_genre.track_id 
                  HAVING count(track_genre.track_id) = ${value.length} 
                ) 
              `;
        }
        case "does not contain all": {
          // Select all records having any (i.e. at least one) of the genre_ids listed in filter.value
          return `\
                track_genre.track_id NOT IN (
                  SELECT DISTINCT(track_genre.track_id) from track_genre
                  WHERE track_genre.genre_id IN (${value.join(", ")})
                )
              `;
        }
        case "does not contain any": {
          // Nested subquery (code in 'NOT IN ( here! )') selects track_ids of tracks having ALL genre_ids listed in filter.value AT THE SAME TIME:
          return `\
                track_genre.track_id NOT IN (
                  SELECT DISTINCT(track_genre.track_id) FROM track_genre 
                  WHERE track_genre.genre_id IN (${value.join(", ")}) 
                  GROUP BY track_genre.track_id 
                  HAVING count(track_genre.track_id) = ${value.length}
                )                
              `;
        }
        default: {
          throw new Error(`[genre] Unknown rule name "${rule}"`);
        }
      }
    }
    default: {
      throw new Error(`Unknown filter name ${name}`);
    }
  }
}

function buildWhere(searchParams: {
  operator: string;
  filters: SearchParams["filters"];
}): string {
  const where = [];

  for (const filter of searchParams.filters) {
    if ("filters" in filter) {
      where.push(`( ${buildWhere(filter)} )`);
    } else {
      where.push(parseFilter(filter));
    }
  }

  return where.join(` ${searchParams.operator} `);
}

export function buildSQLQuery({
  operator,
  filters,
  excludeTracks,
}: SearchParams) {
  return `\
    SELECT 
      tr.track_id, 
      tr.title,
      tr.duration,
      tr.year,
      array_agg(DISTINCT ar.name) AS artist,
      array_agg(DISTINCT ge.genre_id) AS genre_id,
      array_agg(DISTINCT ge.name) AS genre
    FROM track AS tr 
      INNER JOIN track_genre AS tr_ge ON tr.track_id = tr_ge.track_id 
      INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id  
      INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr.track_id
      INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
      INNER JOIN (
        -- Subquery
        SELECT DISTINCT(track.track_id)
        FROM track
        -- TODO do not add this INNER JOIN line if the API query doesn't contain a "genre" filter
        INNER JOIN track_genre ON track.track_id = track_genre.track_id
        WHERE
          ${buildWhere({ operator, filters })}
        -- 
    ) AS condition ON tr.track_id = condition.track_id
    ${
      excludeTracks.length > 0
        ? `WHERE tr.track_id NOT IN (${excludeTracks.join(", ")})`
        : ""
    }
    GROUP BY 
      tr.track_id,
      tr.year
    ORDER BY
      random()
    LIMIT 1
    ;`;
}
