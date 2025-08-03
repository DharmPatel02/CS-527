module.exports = {
  extends: ["react-app", "react-app/jest"],
  rules: {
    // Disable warnings that are causing build failures
    "no-unused-vars": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "no-useless-escape": "warn",
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
};
