/**
 * Gemini 이미지 생성 PoC
 * 실행: GEMINI_API_KEY=... node scripts/poc-gemini-image.mjs
 */

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY 환경변수를 설정하세요');
  process.exit(1);
}

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const OUTPUT_DIR = join(import.meta.dirname, '..', 'docs', 'design', 'poc');
await mkdir(OUTPUT_DIR, { recursive: true });

const TEST_PROMPTS = [
  {
    name: 'navy-puffer',
    prompt: 'A navy puffer jacket, flat lay photography on pure white background, magazine cutout style, no mannequin, isolated garment, high quality product photo, clean edges',
  },
  {
    name: 'beige-knit',
    prompt: 'A beige knit sweater, flat lay photography on pure white background, magazine cutout style, no mannequin, isolated garment, high quality product photo, clean edges',
  },
  {
    name: 'gray-slacks',
    prompt: 'Gray wool slacks trousers, flat lay photography on pure white background, magazine cutout style, no mannequin, isolated garment, high quality product photo, clean edges',
  },
  {
    name: 'white-sneakers',
    prompt: 'White sneakers shoes, flat lay photography on pure white background, magazine cutout style, no mannequin, isolated garment, high quality product photo, clean edges',
  },
];

// ===== Gemini Native Image Generation (gemini-2.5-flash-image) =====
async function testGeminiNative(name, prompt) {
  const model = 'gemini-2.5-flash-image';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  console.log(`  [${model}] ${name}...`);
  const start = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (!res.ok) {
      const errText = await res.text();
      console.log(`  ❌ HTTP ${res.status} (${elapsed}s): ${errText.slice(0, 150)}`);
      return { model, name, success: false, elapsed, error: errText.slice(0, 150) };
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];

    let textPart = '';
    let imageSaved = false;

    for (const part of parts) {
      if (part.text) textPart = part.text;
      if (part.inlineData) {
        const { mimeType, data: b64 } = part.inlineData;
        const ext = mimeType.includes('png') ? 'png' : 'jpg';
        const filePath = join(OUTPUT_DIR, `gemini-${name}.${ext}`);
        await writeFile(filePath, Buffer.from(b64, 'base64'));
        const sizeKB = (Buffer.from(b64, 'base64').length / 1024).toFixed(0);
        console.log(`  ✅ ${filePath} (${elapsed}s, ${sizeKB}KB)`);
        imageSaved = true;
      }
    }

    if (!imageSaved) {
      console.log(`  ⚠️  이미지 없음 (${elapsed}s) — ${textPart.slice(0, 100)}`);
    }

    return { model, name, success: imageSaved, elapsed, text: textPart?.slice(0, 100) };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  ❌ 오류 (${elapsed}s): ${err.message}`);
    return { model, name, success: false, elapsed, error: err.message };
  }
}

// ===== Imagen 4 (predict API) =====
async function testImagen(name, prompt) {
  const model = 'imagen-4.0-generate-001';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${API_KEY}`;

  console.log(`  [${model}] ${name}...`);
  const start = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
        },
      }),
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (!res.ok) {
      const errText = await res.text();
      console.log(`  ❌ HTTP ${res.status} (${elapsed}s): ${errText.slice(0, 150)}`);
      return { model, name, success: false, elapsed, error: errText.slice(0, 150) };
    }

    const data = await res.json();
    const predictions = data?.predictions ?? [];

    if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
      const b64 = predictions[0].bytesBase64Encoded;
      const filePath = join(OUTPUT_DIR, `imagen-${name}.png`);
      await writeFile(filePath, Buffer.from(b64, 'base64'));
      const sizeKB = (Buffer.from(b64, 'base64').length / 1024).toFixed(0);
      console.log(`  ✅ ${filePath} (${elapsed}s, ${sizeKB}KB)`);
      return { model, name, success: true, elapsed };
    }

    console.log(`  ⚠️  이미지 없음 (${elapsed}s)`);
    return { model, name, success: false, elapsed };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  ❌ 오류 (${elapsed}s): ${err.message}`);
    return { model, name, success: false, elapsed, error: err.message };
  }
}

// ===== 실행 =====
console.log('🔍 Gemini 이미지 생성 PoC\n');

// Test 1: Gemini Native
console.log('=== 1. Gemini Native (gemini-2.5-flash-image) ===');
const geminiResults = [];
for (const { name, prompt } of TEST_PROMPTS) {
  const result = await testGeminiNative(name, prompt);
  geminiResults.push(result);
}

// Test 2: Imagen 4
console.log('\n=== 2. Imagen 4 (imagen-4.0-generate-001) ===');
const imagenResults = [];
for (const { name, prompt } of TEST_PROMPTS) {
  const result = await testImagen(name, prompt);
  imagenResults.push(result);
}

// 요약
console.log('\n\n========== 결과 요약 ==========');

function summarize(label, results) {
  const successes = results.filter(r => r.success);
  const avgTime = results.length > 0
    ? (results.reduce((s, r) => s + parseFloat(r.elapsed), 0) / results.length).toFixed(1)
    : '?';
  console.log(`\n[${label}]`);
  console.log(`  성공: ${successes.length}/${results.length}`);
  console.log(`  평균 시간: ${avgTime}s`);
  results.forEach(r => {
    console.log(`  ${r.success ? '✅' : '❌'} ${r.name}: ${r.elapsed}s`);
  });
}

summarize('Gemini Native (gemini-2.5-flash-image)', geminiResults);
summarize('Imagen 4', imagenResults);
