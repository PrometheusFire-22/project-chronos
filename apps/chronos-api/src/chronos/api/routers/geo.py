import json
import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from chronos.api.dependencies import get_db

router = APIRouter(prefix="/api/geo", tags=["geo"])
logger = logging.getLogger(__name__)


@router.get("/choropleth")
async def get_choropleth(
    metric: str = Query("unemployment", description="Metric to query (unemployment, hpi)"),
    date: str | None = Query(None, description="ISO date string (YYYY-MM-DD)"),
    mode: str = Query("geo", description="Response mode: boundaries, data, or geo"),
    db: Session = Depends(get_db),
):
    """
    Returns a FeatureCollection of geometries joined with the requested metric values.
    Modes:
    - boundaries: return just GeoJSON boundaries (no metric data)
    - data: lighter query, return plain JSON array of values (FAST)
    - geo (default): return heavy GeoJSON with geometry (SLOW, LEGACY)
    """
    metric = metric.lower()

    try:
        logger.info(f"[GEO] Request received for metric: {metric}, date: {date}, mode: {mode}")

        # Step 1: Handle modes that don't satisfy metric data first

        # MODE: BOUNDARIES (No metric data)
        if mode == "boundaries":
            boundaries_query = text(
                """
                SELECT
                    name,
                    country_code as country,
                    ST_AsGeoJSON(
                        ST_MakeValid(geometry),
                        6
                    )::json as geometry
                FROM geospatial.ne_boundaries
                ORDER BY name
            """
            )
            res = db.execute(boundaries_query).mappings().all()

            features = []
            for row in res:
                features.append(
                    {
                        "type": "Feature",
                        "geometry": row["geometry"],
                        "properties": {"name": row["name"], "country": row["country"]},
                    }
                )

            return {"type": "FeatureCollection", "features": features}

        # Step 2: Determine the target date (User provided OR latest available)
        target_date = date
        if not target_date:
            date_query = text(
                """
                SELECT MAX(observation_date) as val
                FROM analytics.vw_geo_metrics
                WHERE metric_type = :metric
            """
            )
            result = db.execute(date_query, {"metric": metric}).mappings().first()

            if result and result["val"]:
                target_date = str(result["val"])
                logger.info(f"[GEO] Latest date found: {target_date}")
            else:
                # No data found
                return {"type": "FeatureCollection", "features": []}

        # MODE: DATA or GEO
        query_sql = ""
        if mode == "data":
            query_sql = """
                WITH latest_metrics AS (
                    SELECT DISTINCT ON (geography)
                        geography,
                        value,
                        units,
                        metric_type,
                        observation_date
                    FROM analytics.vw_geo_metrics
                    WHERE metric_type = :metric
                    AND (CAST(:date AS DATE) IS NULL OR observation_date <= CAST(:date AS DATE))
                    ORDER BY geography, observation_date DESC
                )
                SELECT
                    b.name,
                    b.country_code as country,
                    lm.value,
                    lm.units,
                    lm.metric_type as metric,
                    lm.observation_date as date
                FROM geospatial.ne_boundaries b
                LEFT JOIN latest_metrics lm
                    ON b.name = lm.geography
            """
        else:  # Default 'geo'
            query_sql = """
                WITH latest_metrics AS (
                    SELECT DISTINCT ON (geography)
                        geography,
                        value,
                        units,
                        metric_type,
                        observation_date
                    FROM analytics.vw_geo_metrics
                    WHERE metric_type = :metric
                    AND (CAST(:date AS DATE) IS NULL OR observation_date <= CAST(:date AS DATE))
                    ORDER BY geography, observation_date DESC
                )
                SELECT
                    b.name as region_name,
                    b.country_code,
                    ST_AsGeoJSON(
                        ST_MakeValid(b.geometry),
                        6
                    )::json as geometry,
                    lm.value as metric_value,
                    lm.units,
                    lm.metric_type,
                    lm.observation_date
                FROM geospatial.ne_boundaries b
                LEFT JOIN latest_metrics lm
                    ON b.name = lm.geography
                ORDER BY lm.value DESC NULLS LAST
            """

        res = db.execute(text(query_sql), {"metric": metric, "date": target_date}).mappings().all()
        logger.info(f"[GEO] Query completed. Rows: {len(res)}")

        if mode == "data":
            return {
                "type": "DataCollection",
                "data": [
                    {
                        "name": row["name"],
                        "country": row["country"],
                        "value": row["value"],
                        "units": row["units"],
                        "metric": row["metric"],
                        "date": str(row["date"]) if row["date"] else None,
                    }
                    for row in res
                ],
            }

        # Default Geo Mode
        features = []
        for row in res:
            features.append(
                {
                    "type": "Feature",
                    "geometry": row["geometry"],
                    "properties": {
                        "name": row["region_name"],
                        "country": row["country_code"],
                        "value": row["metric_value"],
                        "units": row["units"],
                        "metric": metric,
                        "date": (
                            str(row["observation_date"]) if row["observation_date"] else target_date
                        ),
                    },
                }
            )

        return {"type": "FeatureCollection", "features": features}

    except Exception as e:
        logger.error(f"Geospatial Query Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/lakes")
async def get_lakes():
    """
    Returns GeoJSON for Great Lakes water bodies.
    Reads from local file.
    """
    try:
        # Robustly determine path. Assume Docker /app structure or local dev
        possible_paths = [
            "/app/data/great_lakes.geojson",  # Production Docker
            os.path.join(
                os.getcwd(), "apps", "api", "data", "great_lakes.geojson"
            ),  # Local Monorepo
            os.path.join(os.getcwd(), "data", "great_lakes.geojson"),  # Fallback
        ]

        final_path = None
        for p in possible_paths:
            if os.path.exists(p):
                final_path = p
                break

        if not final_path:
            logger.error(f"[GEO] Great Lakes file not found in: {possible_paths}")
            raise FileNotFoundError("great_lakes.geojson not found")

        with open(final_path) as f:
            data = json.load(f)
            return data

    except Exception as e:
        logger.error(f"[GEO] Error loading Great Lakes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load Great Lakes data") from e
