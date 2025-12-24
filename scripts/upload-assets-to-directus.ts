#!/usr/bin/env tsx

/**
 * Upload Marketing Assets to Directus/R2
 *
 * Uploads all marketing assets (logos, illustrations, favicons) from local
 * filesystem to Directus, which stores them in Cloudflare R2.
 *
 * Folder structure in Directus:
 * - /logos/final/ - Production logos (icon, wordmark)
 * - /illustrations/ - Database modality illustrations, hero graphics
 * - /favicons/ - Favicon variants
 */

import { createDirectus, rest, authentication, uploadFiles } from '@directus/sdk';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

const ASSETS_BASE_PATH = join(process.cwd(), 'marketing/assets');

const client = createDirectus(DIRECTUS_URL)
  .with(authentication())
  .with(rest());

interface UploadedFile {
  localPath: string;
  directusId: string;
  filename: string;
  folder: string;
}

const uploadedFiles: UploadedFile[] = [];

async function main() {
  console.log('🔐 Authenticating with Directus...');

  try {
    await client.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('✅ Authenticated\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    process.exit(1);
  }

  // Upload logos
  console.log('📤 Uploading logos...');
  await uploadFolder(
    join(ASSETS_BASE_PATH, 'logos/final'),
    'logos'
  );

  // Upload illustrations
  console.log('📤 Uploading illustrations...');
  await uploadFolder(
    join(ASSETS_BASE_PATH, 'illustrations'),
    'illustrations'
  );

  // Upload favicons
  console.log('📤 Uploading favicons...');
  await uploadFolder(
    join(ASSETS_BASE_PATH, 'favicons'),
    'favicons'
  );

  console.log(`\n🎉 Upload complete! ${uploadedFiles.length} files uploaded.`);
  console.log('\n📊 Summary:');

  const summary = uploadedFiles.reduce((acc, file) => {
    acc[file.folder] = (acc[file.folder] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(summary).forEach(([folder, count]) => {
    console.log(`  ${folder}: ${count} files`);
  });

  // Write manifest for reference
  const manifest = {
    uploadedAt: new Date().toISOString(),
    totalFiles: uploadedFiles.length,
    files: uploadedFiles,
  };

  writeFileSync(
    join(process.cwd(), 'scripts/.upload-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('\n📝 Manifest saved to scripts/.upload-manifest.json');
}

async function uploadFolder(folderPath: string, directusFolderName: string) {
  try {
    const files = readdirSync(folderPath);

    for (const file of files) {
      const filePath = join(folderPath, file);
      const stats = statSync(filePath);

      if (stats.isFile()) {
        await uploadFile(filePath, directusFolderName);
      }
    }
  } catch (error: any) {
    console.error(`❌ Error uploading folder ${folderPath}:`, error.message);
  }
}

async function uploadFile(filePath: string, folder: string) {
  try {
    const filename = basename(filePath);
    const fileBuffer = readFileSync(filePath);

    // Create a FormData-compatible object
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, filename);
    formData.append('folder', folder);
    formData.append('storage', 'r2'); // Use R2 storage

    const response = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    const fileId = result.data.id;

    uploadedFiles.push({
      localPath: filePath,
      directusId: fileId,
      filename,
      folder,
    });

    console.log(`  ✅ ${filename} → ${folder}/`);
  } catch (error: any) {
    console.error(`  ❌ Failed to upload ${basename(filePath)}:`, error.message);
  }
}

async function getAuthToken(): Promise<string> {
  // Get the current auth token from the client
  // This is a simplified version - in production, you'd store the token
  const token = (client as any).auth?.token;
  return token || '';
}

function writeFileSync(path: string, content: string) {
  require('fs').writeFileSync(path, content);
}

main().catch(console.error);
