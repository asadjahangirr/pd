import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import readline from "readline";

/* One-time helper: turns your chosen admin password into a bcrypt hash and
   generates a JWT secret. Prints the lines to paste into server/.env.
   Nothing is stored by this script — you copy the output yourself.

   Usage:
     npm run setup:admin                     (prompts; password is visible)
     npm run setup:admin -- MyPassword       (username defaults to "admin")
     npm run setup:admin -- admin MyPassword (username + password)          */

function ask(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log("\n=== Delight Pharma — admin setup ===\n");

  const args = process.argv.slice(2);
  let username, password;
  if (args.length >= 2) {
    [username, password] = args;
  } else if (args.length === 1) {
    username = "admin";
    password = args[0];
  } else {
    username = (await ask("Admin username (default 'admin'): ")).trim() || "admin";
    password = await ask("Admin password (visible as you type): ");
  }

  username = username.trim();
  password = String(password).trim();

  if (password.length < 6) {
    console.error("\n✗ Password must be at least 6 characters. Nothing generated.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  console.log("\n------------------------------------------------------------");
  console.log("Add (or replace) these lines in server/.env:\n");
  console.log(`ADMIN_USERNAME=${username}`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  if (!process.env.JWT_SECRET) {
    console.log(`JWT_SECRET=${crypto.randomBytes(48).toString("hex")}`);
  } else {
    console.log("# JWT_SECRET already set in .env — keep your existing one.");
  }
  console.log("------------------------------------------------------------\n");
  console.log(`✓ Username: "${username}"  |  Password: the one you just entered above.\n`);
  process.exit(0);
}

main();
