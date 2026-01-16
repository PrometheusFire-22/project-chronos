import { pool } from '../src/db/client.js';
import fs from 'fs';
import path from 'path';

async function extractGeometry() {
    try {
        console.log('Extracting geometry to static file...');
        const query = `
            SELECT json_build_object(
                'type', 'FeatureCollection',
                'features', json_agg(
                    json_build_object(
                        'type', 'Feature',
                        'geometry', ST_AsGeoJSON(geometry)::json,
                        'properties', json_build_object(
                            'name', region_name,
                            'country', country_code
                        )
                    )
                )
            ) as geojson
            FROM analytics.vw_choropleth_boundaries
        `;

        const res = await pool.query(query);
        const geojson = res.rows[0].geojson;
        
        const outputPath = path.resolve(process.cwd(), 'apps/web/public/north_america.json');
        fs.writeFileSync(outputPath, JSON.stringify(geojson));
        console.log(`Geometry saved to ${outputPath}`);
        console.log(`Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

extractGeometry();
