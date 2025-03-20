(function () {
  function ChangeTheme() {
    function updateTheme() {
      const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.body.setAttribute("data-bs-theme", theme);
    }
// 初始化主题
    updateTheme();
// 监听主题变化
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);
  }

  $(function () {
    ChangeTheme()
  });
})()