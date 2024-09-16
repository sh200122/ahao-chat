export default function removeConsolePlugin() {
  return {
    name: "vite-plugin-remove-console",
    apply: "build", // 仅在生产构建时应用

    transform(src, id) {
      if (id.endsWith(".js")) {
        // 删除 console.log 调用
        const transformedCode = src.replace(/console\.log\(.+?\);?/g, "");
        return {
          code: transformedCode,
          map: null, // 可以返回 sourcemap，生产环境中通常不需要
        };
      }
    },
  };
}
