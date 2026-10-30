// Pengacak untuk tes yang menguji banyak masukan acak. Hanya dipakai file *.test.js.
//
// Bawaan: biji tetap, jadi `npm test` selalu menjalankan masukan yang sama dan hasilnya bisa diulang (tidak ada kegagalan "kadang-kadang").
// Untuk berburu kasus langka:  TEST_SEED=random npm test   atau   TEST_SEED=123 npm test.
// Biji yang dipakai dicetak bila TEST_SEED diisi, supaya kegagalan bisa diulang dengan TEST_SEED yang sama.
import process from 'node:process'
import { seeded } from './seededRandom.js'

const env = process.env.TEST_SEED
export const SEED = env === undefined || env === '' ? 20261030 : env === 'random' ? Math.floor(Math.random() * 2 ** 31) : Number(env)
if (!Number.isFinite(SEED)) throw new Error(`TEST_SEED tidak valid: ${env}`)
if (env) console.log(`# TEST_SEED=${SEED}`)

/** Pengganti Math.random(): angka [0,1) dari biji di atas. */
export const rand = seeded(SEED)
