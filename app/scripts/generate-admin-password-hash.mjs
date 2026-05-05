#!/usr/bin/env node
import { randomBytes, scryptSync } from 'node:crypto'

const password = process.argv[2]
if (!password || password.length < 12) {
  console.error('Usage: node scripts/generate-admin-password-hash.mjs "<password-min-12>"')
  process.exit(1)
}

const N = 16384
const r = 8
const p = 1
const keyLen = 64
const salt = randomBytes(16)
const hash = scryptSync(password, salt, keyLen, { N, r, p })

const encoded = [
  'scrypt',
  String(N),
  String(r),
  String(p),
  String(keyLen),
  salt.toString('base64'),
  hash.toString('base64'),
].join('$')

console.log(encoded)
