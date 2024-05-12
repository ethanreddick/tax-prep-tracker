const fs = require("fs");
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const args = process.argv.slice(2);
const credentials = { user: args[0], password: args[1] };

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

const encryptedCredentials = encrypt(JSON.stringify(credentials));
fs.writeFileSync(
  "config.json",
  JSON.stringify({
    data: encryptedCredentials,
    key: key.toString("hex"),
    iv: iv.toString("hex"),
  }),
  "utf8",
);
