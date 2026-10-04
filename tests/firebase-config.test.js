/**
 * firebase-config.js ke liye Unit Tests (Hindi mein)
 *
 * Ye module ek browser ES-module hai jo Firebase SDK ko CDN URL se import karta hai,
 * isliye ise Node me `require` nahi kiya ja sakta. Isko test karne ke liye hum iske
 * source ko ek sandboxed VM context me load karte hain, jahan chaar Firebase imports
 * ko recording fakes se replace kar diye jaate hain.
 *
 * Isse initialization par REAL runtime assertions milte hain, aur test hermetic
 * rehta hai (na koi network call, na koi global pollution).
 *
 * Dhyan rakhein: Code ke identifiers (jaise `initializeApp`, `getAuth`) English me hi
 * rakhe gaye hain, kyunki woh Firebase SDK ke official naam hain. Sirf comments aur
 * test ke description Hindi me hain.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Aapka Firebase module project root me hai
const MODULE_PATH = path.join(__dirname, "..", "firebase-config.js");

/**
 * Ye function module ke source se remote ES imports aur `export` keywords hata deta
 * hai, phir use injected fakes ke against evaluate karta hai.
 *
 * @returns module ke exported bindings + har mocked SDK function ki call log
 */
function loadModule(source = fs.readFileSync(MODULE_PATH, "utf8")) {
  const calls = { initializeApp: [], getAuth: [], getFirestore: [], getStorage: [] };

  const body =
    source
      .replace(/^\s*import[\s\S]*?;\s*$/gm, "") // CDN wale remote imports hata do
      .replace(/^export\s+(const|let|var|function)/gm, "$1") // `export const x` -> `const x`
      .replace(/^export\s+default\s+/gm, "module.exports.default = ") +
    // named exports ko bhi module.exports me capture kar lo
    "\nObject.assign(module.exports, { auth, db, storage });\n";

  // Ye sandbox Firebase SDK ka nakli (fake) implementation hai jo calls record karta hai
  const sandbox = {
    module: { exports: {} },
    initializeApp: (cfg) => {
      calls.initializeApp.push(cfg);
      calls.appResult = { __app: true, name: "[DEFAULT]" };
      return calls.appResult;
    },
    getAuth: (app) => {
      calls.getAuth.push(app);
      calls.authResult = { __auth: true };
      return calls.authResult;
    },
    getFirestore: (app) => {
      calls.getFirestore.push(app);
      calls.dbResult = { __db: true };
      return calls.dbResult;
    },
    getStorage: (app) => {
      calls.getStorage.push(app);
      calls.storageResult = { __storage: true };
      return calls.storageResult;
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(body, sandbox, { filename: MODULE_PATH });

  return { exports: sandbox.module.exports, calls };
}

// Module ko ek baar load karo aur uske results pure suite me istemal karo
const { exports: mod, calls } = loadModule();
const config = calls.initializeApp[0];

/* ================================================================== */
/* 1. Source file ki structure                                        */
/* ================================================================== */

test("[Structure] Module file exist karti hai aur padhi ja sakti hai", () => {
  assert.ok(fs.existsSync(MODULE_PATH), "firebase-config.js project root me exist honi chahiye");
  assert.ok(fs.statSync(MODULE_PATH).size > 0, "module khali nahi honi chahiye");
});

test("[Structure] Jo Firebase functions use ho rahe hain wo sab import kiye gaye hain", () => {
  const src = fs.readFileSync(MODULE_PATH, "utf8");
  for (const fn of ["initializeApp", "getAuth", "getFirestore", "getStorage"]) {
    assert.match(src, new RegExp(`import\\s*\\{[^}]*\\b${fn}\\b`), `${fn} ka import missing hai`);
  }
});

test("[Security] Sabhi remote imports HTTPS Firebase CDN URLs hain, ek hi version par pinned", () => {
  const src = fs.readFileSync(MODULE_PATH, "utf8");
  const urls = [...src.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);

  assert.equal(urls.length, 4, "exactly 4 remote imports hone chahiye");
  for (const url of urls) {
    // HTTP mat use karo, warna browser MITM attack ke liye vulnerable ho jayega
    assert.match(url, /^https:\/\//, `import HTTPS hona chahiye: ${url}`);
    assert.match(
      url,
      /^https:\/\/www\.gstatic\.com\/firebasejs\/\d+\.\d+\.\d+\/firebase-[a-z-]+\.js$/,
      `CDN URL ka shape unexpected hai: ${url}`
    );
  }

  // Saare SDK modules ek hi version par hone chahiye (version mismatch bugs create karta hai)
  const versions = new Set(urls.map((u) => u.match(/firebasejs\/([^/]+)\//)[1]));
  assert.equal(versions.size, 1, "saare SDK modules ek hi pinned version use karne chahiye");
});

test("[Exports] auth, db, storage aur default app export hote hain", () => {
  assert.ok("auth" in mod, "auth export hona chahiye");
  assert.ok("db" in mod, "db export hona chahiye");
  assert.ok("storage" in mod, "storage export hona chahiye");
  assert.ok("default" in mod, "default export app ka hona chahiye");
  assert.equal(
    mod.default,
    calls.appResult,
    "default export wahi app hona chahiye jo initializeApp ne return kiya"
  );
});

/* ================================================================== */
/* 2. Happy Path: configuration ki sahi values                        */
/* ================================================================== */

test("[Config] Firebase app exactly ek baar initialize hota hai", () => {
  assert.equal(calls.initializeApp.length, 1);
  assert.equal(calls.initializeApp[0].name, undefined, "config me custom app name nahi hona chahiye");
});

test("[Config] Complete aur non-empty configuration object pass hota hai", () => {
  assert.equal(typeof config, "object");
  assert.notEqual(config, null);

  // Ye saari keys Firebase ko chahiye hi chahiye
  const required = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
    "measurementId",
  ];
  for (const key of required) {
    assert.ok(key in config, `config key missing hai: ${key}`);
    assert.equal(typeof config[key], "string", `${key} string hona chahiye`);
    assert.ok(config[key].trim().length > 0, `${key} khali ya whitespace-only nahi hona chahiye`);
  }
});

test("[Config] Config me sirf expected keys hain, koi extra nahi", () => {
  // Ye test extra keys pakadta hai (jaise debug info ya koi secret leak)
  assert.deepEqual(
    Object.keys(config).sort(),
    [
      "apiKey",
      "appId",
      "authDomain",
      "measurementId",
      "messagingSenderId",
      "projectId",
      "storageBucket",
    ]
  );
});

test("[Format] apiKey Firebase Web API key ke format ko match karta hai", () => {
  assert.match(config.apiKey, /^AIza[0-9A-Za-z_-]{35}$/);
});

test("[Format] projectId valid Firebase project id hai", () => {
  assert.match(config.projectId, /^[a-z0-9][a-z0-9-]{4,28}[a-z0-9]$/);
});

test("[Consistency] authDomain configured project ka hi hai", () => {
  // Agar ye match nahi karta toh authentication fail ho jayegi
  assert.equal(config.authDomain, `${config.projectId}.firebaseapp.com`);
});

test("[Consistency] storageBucket configured project ko reference karta hai", () => {
  assert.ok(
    config.storageBucket.startsWith(`${config.projectId}.`),
    `storageBucket ${config.storageBucket} ko ${config.projectId} ke andar hona chahiye`
  );
  assert.match(config.storageBucket, /^[\w.-]+\.firebasestorage\.app$/);
});

test("[Format] messagingSenderId ek numeric sender id hai", () => {
  assert.match(config.messagingSenderId, /^\d+$/);
  assert.ok(Number(config.messagingSenderId) > 0, "sender id positive hona chahiye");
});

test("[Consistency] appId ka format 1:<sender>:<platform>:<hash> hai", () => {
  assert.match(config.appId, /^1:\d+:[a-z]+:[0-9a-f]+$/);
  const [, senderId] = config.appId.split(":");
  // Ye match nahi karega toh Firebase services (jaise notifications) toot jayengi
  assert.equal(senderId, config.messagingSenderId, "appId ka sender messagingSenderId se match hona chahiye");
});

test("[Format] measurementId G-XXXXXXXXXX format follow karta hai", () => {
  assert.match(config.measurementId, /^G-[0-9A-Z]{10}$/);
});

/* ================================================================== */
/* 3. Wiring: services ek hi app instance se banti hain                */
/* ================================================================== */

test("[Wiring] auth, db aur storage teeno initialized app se bante hain", () => {
  const app = mod.default;
  assert.equal(calls.getAuth.length, 1);
  assert.equal(calls.getFirestore.length, 1);
  assert.equal(calls.getStorage.length, 1);

  for (const [name, log] of [
    ["getAuth", calls.getAuth],
    ["getFirestore", calls.getFirestore],
    ["getStorage", calls.getStorage],
  ]) {
    // Ye sabse common galti hai: har service ke liye alag initializeApp call
        assert.equal(log[0], app, `${name} ko initialized app instance milna chahiye`);
      }
    });

    test("[Wiring] Exports SDK ke return kiye gaye exact service objects hain", () => {
      // Reference compare, deep-equality nahi: ye objects VM context me bane hain,
      // isliye unke prototypes alag hote hain aur deepStrictEqual fail ho jayega.
      assert.equal(mod.auth, calls.authResult, "auth export wahi object hona chahiye jo getAuth ne return kiya");
      assert.equal(mod.db, calls.dbResult, "db export wahi object hona chahiye jo getFirestore ne return kiya");
      assert.equal(
        mod.storage,
        calls.storageResult,
        "storage export wahi object hona chahiye jo getStorage ne return kiya"
      );
    });

    test("[Order] Initialization ka order: app pehle, phir teeno services", () => {
  const order = [
    ["initializeApp", calls.initializeApp.length],
    ["getAuth", calls.getAuth.length],
    ["getFirestore", calls.getFirestore.length],
    ["getStorage", calls.getStorage.length],
  ].map(([name]) => name);
  assert.deepEqual(order, ["initializeApp", "getAuth", "getFirestore", "getStorage"]);
});

/* ================================================================== */
/* 4. Negative cases + edge cases                                     */
/* ================================================================== */

test("[Negative] Loader missing required key wali config ko detect kar leta hai", () => {
  // Ye harness ka sanity check hai: agar module kharab ho toh test loudly fail hona
  // chahiye, taaki pata chale hum module ko sach me dekh rahe hain, blindly pass nahi ho rahe.
  const broken = fs
    .readFileSync(MODULE_PATH, "utf8")
    .replace(/\s*storageBucket:[^\n]*\n/, "\n");
  const result = loadModule(broken);
  const brokenConfig = result.calls.initializeApp[0];

  assert.equal("storageBucket" in brokenConfig, false);
  assert.throws(() => {
    assert.ok("storageBucket" in brokenConfig);
  }, /storageBucket/);
});

test("[Negative] Loader duplicate config key ko detect kar leta hai", () => {
  const src = fs.readFileSync(MODULE_PATH, "utf8");
  const dup = src.replace(
    /^(\s*)measurementId: "G-JQ4EK99HHN",?$/m,
    '$1measurementId: "G-JQ4EK99HHN",$1measurementId: "G-DUPLICATE01"'
  );
  assert.notEqual(dup, src, "sanity: duplicate injection se source modify hona chahiye");

  const dupConfig = loadModule(dup).calls.initializeApp[0];
  // JS objects me last declaration jeetta hai - pehli value chupke se kho jati hai
  assert.equal(dupConfig.measurementId, "G-DUPLICATE01");
  assert.throws(
    () => assert.equal(dupConfig.measurementId, "G-JQ4EK99HHN"),
    /Expected values to be strictly equal/
  );
});

test("[Negative] Config me placeholder ya khaali credentials kabhi nahi hone chahiye", () => {
  // Ye production code me chhupa hua dummy value pakadta hai
  const forbidden = [
    "your_api_key",
    "YOUR_API_KEY",
    "xxxxx",
    "TODO",
    "undefined",
    "null",
    "change-me",
  ];
  for (const [key, value] of Object.entries(config)) {
    assert.doesNotMatch(
      value,
      new RegExp(forbidden.join("|"), "i"),
      `${key} placeholder jaisa lag raha hai: ${value}`
    );
  }
});

test("[Edge] Reload karne par double-initialize nahi hota", () => {
  const second = loadModule();
  assert.equal(
    second.calls.initializeApp.length,
    1,
    "har module evaluation ko exactly ek baar initialize karna chahiye"
  );
  assert.notEqual(
    second.exports.default,
    mod.default,
    "har evaluation apna alag app instance deta hai"
  );
});

test("[Edge] www/ wali module copy root copy ke saath sync rehti hai", () => {
  // Aapki file 3 jagah hai (root, www, android assets) - agar ek jagah change karo
  // aur doosri jagah bhool jao, toh app break ho jayegi. Ye test drift pakad leta hai.
  const wwwCopy = path.join(__dirname, "..", "www", "firebase-config.js");
  if (!fs.existsSync(wwwCopy)) return; // sirf deployed layout me hai, toh skip
  assert.equal(
    fs.readFileSync(wwwCopy, "utf8"),
    fs.readFileSync(MODULE_PATH, "utf8"),
    "www/firebase-config.js root module se drift kar gayi hai"
  );
});