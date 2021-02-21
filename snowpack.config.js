// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
        /* ... */
    },
    plugins: [
        /* ... */
    ],
    packageOptions: {
        /* ... */
    },
    devOptions: {
        /* ... */
        secure: true,
    },
    buildOptions: {
        /* ... */
    },
    routes: [{ match: "routes", src: ".*", dest: "/index.html" }],
};
