import expo from "eslint-config-expo";
import importPlugin from "eslint-plugin-import";

export default [
  expo,
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
];
