const RULES = {
  WARN: "warn",
  ERROR: "error",
  OFF: "off",
}

module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["standard", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "unused-vars": RULES.WARN,
  },
}
