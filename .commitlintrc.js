export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["base", "dom", "native", "workspace", "deps", "types", "utils"],
    ],
  },
};
