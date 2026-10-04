const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const https = require("https");

const ROOT = process.cwd();
const PACKAGE_FILE = path.join(ROOT, "package.json");
const BUN_LOCK = path.join(ROOT, "bun.lock");
const BUN_LOCKB = path.join(ROOT, "bun.lockb");

function run(command, options = {}) {
    console.log(`\n> ${command}`);

    try {
        execSync(command, {
            cwd: ROOT,
            stdio: "inherit",
            shell: true,
            ...options
        });

        return true;
    } catch (error) {
        console.error(`\nCommand failed: ${command}`);
        return false;
    }
}

function checkCommand(command) {
    try {
        execSync(command, {
            stdio: "ignore",
            shell: true
        });
        return true;
    } catch {
        return false;
    }
}

function checkPackage(packageName, version) {
    return new Promise((resolve) => {
        const encoded = encodeURIComponent(packageName);

        const request = https.get(
            `https://registry.npmjs.org/${encoded}`,
            {
                headers: {
                    "User-Agent": "dependency-checker"
                }
            },
            (response) => {
                let data = "";

                response.on("data", chunk => {
                    data += chunk;
                });

                response.on("end", () => {
                    if (response.statusCode !== 200) {
                        resolve({
                            packageName,
                            version,
                            valid: false,
                            reason: `npm registry returned HTTP ${response.statusCode}`
                        });
                        return;
                    }

                    try {
                        const packageData = JSON.parse(data);

                        if (!packageData.versions) {
                            resolve({
                                packageName,
                                version,
                                valid: false,
                                reason: "No versions found"
                            });
                            return;
                        }

                        let requestedVersion = version;

                        // Handle workspace/file/link dependencies separately
                        if (
                            requestedVersion.startsWith("workspace:") ||
                            requestedVersion.startsWith("file:") ||
                            requestedVersion.startsWith("link:")
                        ) {
                            resolve({
                                packageName,
                                version,
                                valid: true,
                                reason: "Local/workspace dependency"
                            });
                            return;
                        }

                        // Handle latest/tag dependencies
                        if (packageData["dist-tags"]?.[requestedVersion]) {
                            resolve({
                                packageName,
                                version,
                                valid: true,
                                resolved: packageData["dist-tags"][requestedVersion]
                            });
                            return;
                        }

                        // Direct version
                        if (packageData.versions[requestedVersion]) {
                            resolve({
                                packageName,
                                version,
                                valid: true,
                                resolved: requestedVersion
                            });
                            return;
                        }

                        // Basic semver/range validation.
                        // Actual resolution will be handled by Bun.
                        const availableVersions =
                            Object.keys(packageData.versions);

                        const majorMatch = requestedVersion.match(/\d+/);

                        if (majorMatch) {
                            const major = majorMatch[0];

                            const matching = availableVersions.filter(v =>
                                v.startsWith(`${major}.`)
                            );

                            if (matching.length > 0) {
                                resolve({
                                    packageName,
                                    version,
                                    valid: true,
                                    reason: "Version range appears resolvable"
                                });
                                return;
                            }
                        }

                        resolve({
                            packageName,
                            version,
                            valid: false,
                            reason: "Requested version was not found"
                        });

                    } catch {
                        resolve({
                            packageName,
                            version,
                            valid: false,
                            reason: "Invalid npm registry response"
                        });
                    }
                });
            }
        );

        request.on("error", (error) => {
            resolve({
                packageName,
                version,
                valid: false,
                reason: error.message
            });
        });

        request.setTimeout(10000, () => {
            request.destroy();

            resolve({
                packageName,
                version,
                valid: false,
                reason: "Registry request timed out"
            });
        });
    });
}

async function main() {
    console.log("==============================================");
    console.log("   NPM + BUN DEPENDENCY HEALTH CHECK");
    console.log("==============================================");

    // --------------------------------------------------
    // 1. Check package.json
    // --------------------------------------------------

    if (!fs.existsSync(PACKAGE_FILE)) {
        console.error("\nERROR: package.json was not found.");
        process.exit(1);
    }

    let packageJson;

    try {
        packageJson = JSON.parse(
            fs.readFileSync(PACKAGE_FILE, "utf8")
        );
    } catch (error) {
        console.error("\nERROR: package.json contains invalid JSON.");
        console.error(error.message);
        process.exit(1);
    }

    console.log("\n✓ package.json loaded");

    // --------------------------------------------------
    // 2. Check Bun
    // --------------------------------------------------

    if (!checkCommand("bun --version")) {
        console.error(
            "\nERROR: Bun is not installed or is not available in PATH."
        );

        console.error(
            "\nInstall Bun first, then run this script again."
        );

        process.exit(1);
    }

    const bunVersion = execSync("bun --version", {
        encoding: "utf8",
        shell: true
    }).trim();

    console.log(`✓ Bun detected: ${bunVersion}`);

    // --------------------------------------------------
    // 3. Collect dependencies
    // --------------------------------------------------

    const dependencyGroups = [
        ["dependencies", packageJson.dependencies || {}],
        ["devDependencies", packageJson.devDependencies || {}],
        ["optionalDependencies", packageJson.optionalDependencies || {}],
        ["peerDependencies", packageJson.peerDependencies || {}]
    ];

    const packages = [];

    for (const [group, dependencies] of dependencyGroups) {
        for (const [name, version] of Object.entries(dependencies)) {
            packages.push({
                group,
                name,
                version
            });
        }
    }

    console.log(`\nFound ${packages.length} dependency entries.`);

    // --------------------------------------------------
    // 4. Check dependency URLs and package specifications
    // --------------------------------------------------

    console.log("\n----------------------------------------------");
    console.log("Checking dependency specifications");
    console.log("----------------------------------------------");

    const suspicious = [];

    for (const pkg of packages) {
        const value = String(pkg.version);

        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("git+") ||
            value.startsWith("git://") ||
            value.startsWith("github:")
        ) {
            suspicious.push(pkg);

            console.log(
                `⚠ ${pkg.name}@${pkg.version} -> external URL/Git dependency`
            );
        }
    }

    if (suspicious.length === 0) {
        console.log("✓ No external Git/HTTP dependency URLs detected.");
    }

    // --------------------------------------------------
    // 5. Check packages against npm registry
    // --------------------------------------------------

    console.log("\n----------------------------------------------");
    console.log("Checking npm registry");
    console.log("----------------------------------------------");

    const results = [];

    // Run sequentially to avoid hammering npm registry
    for (const pkg of packages) {
        // Skip local/Git/URL dependencies
        if (
            pkg.version.startsWith("file:") ||
            pkg.version.startsWith("link:") ||
            pkg.version.startsWith("workspace:") ||
            pkg.version.startsWith("git+") ||
            pkg.version.startsWith("git://") ||
            pkg.version.startsWith("github:") ||
            pkg.version.startsWith("http://") ||
            pkg.version.startsWith("https://")
        ) {
            console.log(
                `↷ Skipping registry check: ${pkg.name}@${pkg.version}`
            );

            continue;
        }

        process.stdout.write(
            `Checking ${pkg.name}@${pkg.version} ... `
        );

        const result = await checkPackage(
            pkg.name,
            pkg.version
        );

        results.push(result);

        if (result.valid) {
            console.log("✓");
        } else {
            console.log("✗");
            console.log(`    ${result.reason}`);
        }
    }

    // --------------------------------------------------
    // 6. Print invalid packages
    // --------------------------------------------------

    const invalid = results.filter(
        result => !result.valid
    );

    console.log("\n----------------------------------------------");
    console.log("Dependency report");
    console.log("----------------------------------------------");

    if (invalid.length === 0) {
        console.log("✓ All registry dependencies appear valid.");
    } else {
        console.log(
            `✗ ${invalid.length} dependency problem(s) detected:\n`
        );

        for (const item of invalid) {
            console.log(
                `  ${item.packageName}@${item.version}`
            );

            console.log(
                `    ${item.reason}`
            );
        }
    }

    // --------------------------------------------------
    // 7. Check Bun lockfile
    // --------------------------------------------------

    console.log("\n----------------------------------------------");
    console.log("Checking Bun lockfile");
    console.log("----------------------------------------------");

    const lockExists =
        fs.existsSync(BUN_LOCK) ||
        fs.existsSync(BUN_LOCKB);

    if (lockExists) {
        console.log("✓ Existing Bun lockfile found.");
    } else {
        console.log(
            "⚠ No Bun lockfile found. One will be generated."
        );
    }

    // --------------------------------------------------
    // 8. Backup existing lockfile
    // --------------------------------------------------

    if (fs.existsSync(BUN_LOCK)) {
        const backup =
            path.join(ROOT, "bun.lock.backup");

        fs.copyFileSync(BUN_LOCK, backup);

        console.log(
            `✓ Backup created: ${path.basename(backup)}`
        );
    }

    if (fs.existsSync(BUN_LOCKB)) {
        const backup =
            path.join(ROOT, "bun.lockb.backup");

        fs.copyFileSync(BUN_LOCKB, backup);

        console.log(
            `✓ Backup created: ${path.basename(backup)}`
        );
    }

    // --------------------------------------------------
    // 9. Remove stale lockfiles
    // --------------------------------------------------

    console.log("\nRemoving stale Bun lockfiles...");

    if (fs.existsSync(BUN_LOCK)) {
        fs.unlinkSync(BUN_LOCK);
        console.log("✓ Removed bun.lock");
    }

    if (fs.existsSync(BUN_LOCKB)) {
        fs.unlinkSync(BUN_LOCKB);
        console.log("✓ Removed bun.lockb");
    }

    // --------------------------------------------------
    // 10. Install dependencies and regenerate lockfile
    // --------------------------------------------------

    console.log("\n==============================================");
    console.log("Regenerating Bun dependency graph");
    console.log("==============================================");

    const installSuccess = run(
        "bun install"
    );

    if (!installSuccess) {
        console.error(
            "\n✗ Bun installation failed."
        );

        console.error(
            "\nThe problem is likely an invalid dependency,"
        );

        console.error(
            "peer dependency conflict, unavailable package,"
        );

        console.error(
            "or an incompatible package version."
        );

        process.exit(1);
    }

    // --------------------------------------------------
    // 11. Verify lockfile
    // --------------------------------------------------

    console.log("\n----------------------------------------------");
    console.log("Verifying generated lockfile");
    console.log("----------------------------------------------");

    if (!fs.existsSync(BUN_LOCK)) {
        console.error(
            "✗ bun.lock was not generated."
        );

        process.exit(1);
    }

    console.log("✓ bun.lock successfully generated.");

    // --------------------------------------------------
    // 12. Check installed dependency tree
    // --------------------------------------------------

    console.log("\n----------------------------------------------");
    console.log("Checking dependency tree");
    console.log("----------------------------------------------");

    const treeSuccess = run(
        "bun pm ls"
    );

    if (!treeSuccess) {
        console.warn(
            "\n⚠ Bun reported dependency-tree issues."
        );
    }

    // --------------------------------------------------
    // 13. Verify frozen installation
    // --------------------------------------------------

    console.log("\n==============================================");
    console.log("Testing frozen-lockfile installation");
    console.log("==============================================");

    const frozenSuccess = run(
        "bun install --frozen-lockfile"
    );

    if (!frozenSuccess) {
        console.error(
            "\n✗ Frozen lockfile verification failed."
        );

        console.error(
            "The generated bun.lock does not reproduce the dependency tree correctly."
        );

        process.exit(1);
    }

    // --------------------------------------------------
    // 14. Final report
    // --------------------------------------------------

    console.log("\n==============================================");
    console.log("DEPENDENCY CHECK COMPLETE");
    console.log("==============================================");

    if (invalid.length > 0) {
        console.log(
            `⚠ ${invalid.length} npm package specification(s) need attention.`
        );
    } else {
        console.log(
            "✓ npm dependency specifications look valid."
        );
    }

    console.log("✓ Bun dependency installation succeeded.");
    console.log("✓ bun.lock regenerated.");
    console.log("✓ Frozen-lockfile verification succeeded.");

    console.log(
        "\nYour project is now using a freshly generated bun.lock."
    );
}

main().catch(error => {
    console.error("\nUnexpected error:");
    console.error(error);

    process.exit(1);
});
