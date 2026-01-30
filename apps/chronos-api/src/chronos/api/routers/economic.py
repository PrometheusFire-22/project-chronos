import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from chronos.api.dependencies import get_db

router = APIRouter(prefix="/api/economic", tags=["economic"])
logger = logging.getLogger(__name__)


@router.get("/series")
async def get_series(db: Session = Depends(get_db)):
    """Fetches metadata for all active series."""
    try:
        query = text(
            """
            SELECT sm.series_id, sm.series_name, sm.geography, sm.units, sm.unit_type, sm.display_units, sm.frequency, ds.source_name
            FROM metadata.series_metadata sm
            JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
            WHERE sm.is_active = TRUE
            ORDER BY sm.series_name ASC;
        """
        )
        result = db.execute(query).mappings().all()
        return [dict(row) for row in result]
    except Exception as e:
        logger.error(f"Error fetching series metadata: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/geographies")
async def get_geographies(db: Session = Depends(get_db)):
    """Fetches all unique geographies."""
    try:
        query = text(
            """
            SELECT DISTINCT geography
            FROM metadata.series_metadata
            WHERE is_active = TRUE AND geography IS NOT NULL
            ORDER BY geography ASC;
        """
        )
        result = db.execute(query).mappings().all()
        return [row["geography"] for row in result]
    except Exception as e:
        logger.error(f"Error fetching geographies: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/timeseries")
async def get_timeseries(
    series_ids: str = Query(..., description="Comma-separated list of series IDs"),
    start_date: str | None = Query(None, alias="start"),
    end_date: str | None = Query(None, alias="end"),
    geographies: str | None = Query(None, alias="geos"),
    bucket_interval: str = Query("1 day", alias="interval"),
    db: Session = Depends(get_db),
):
    """Fetches bucketed timeseries data."""
    try:
        # Validate bucket interval to prevent SQL injection or bad inputs
        valid_intervals = ["1 day", "1 week", "1 month", "1 year", "1 quarter"]
        if bucket_interval not in valid_intervals:
            # Fallback to day if invalid
            bucket_interval = "1 day"

        series_id_list = [int(sid) for sid in series_ids.split(",") if sid.strip().isdigit()]
        if not series_id_list:
            return []

        where_clauses = ["eo.series_id = ANY(:series_ids)"]
        params = {"series_ids": series_id_list, "bucket_interval": bucket_interval}

        if start_date:
            where_clauses.append("eo.observation_date >= CAST(:start_date AS DATE)")
            params["start_date"] = start_date

        if end_date:
            where_clauses.append("eo.observation_date <= CAST(:end_date AS DATE)")
            params["end_date"] = end_date

        if geographies:
            geo_list = [g.strip() for g in geographies.split(",") if g.strip()]
            if geo_list:
                where_clauses.append("sm.geography = ANY(:geographies)")
                params["geographies"] = geo_list

        query_sql = f"""
            SELECT
              time_bucket(:bucket_interval, eo.observation_date) AS time,
              eo.series_id,
              CAST(AVG(eo.value) AS FLOAT) AS value,
              sm.series_name,
              sm.units,
              sm.unit_type,
              sm.display_units
            FROM timeseries.economic_observations eo
            JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
            WHERE {" AND ".join(where_clauses)}
            GROUP BY time, eo.series_id, sm.series_name, sm.units, sm.unit_type, sm.display_units
            ORDER BY time ASC;
        """

        result = db.execute(text(query_sql), params).mappings().all()

        # Convert date objects to strings for JSON response
        return [
            {
                "time": (
                    row["time"].isoformat()
                    if hasattr(row["time"], "isoformat")
                    else str(row["time"])
                ),
                "series_id": row["series_id"],
                "value": row["value"],
                "series_name": row["series_name"],
                "units": row["units"],
                "unit_type": row["unit_type"],
                "display_units": row["display_units"],
            }
            for row in result
        ]

    except Exception as e:
        logger.error(f"Error fetching timeseries data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e
