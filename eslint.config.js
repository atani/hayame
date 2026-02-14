export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        chrome: "readonly",
        document: "readonly",
        window: "readonly",
        location: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        HTMLVideoElement: "readonly",
        Object: "readonly",
        WeakMap: "readonly",
        MutationObserver: "readonly",
        getComputedStyle: "readonly",
        module: "readonly",
        createYouTubeAdSkipper: "readonly",
        createPrimeVideoAdSkipper: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },
];
